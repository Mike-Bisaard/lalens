export interface SlipVerifyResult {
  success: boolean
  amount?: number
  receiver_account?: string
  transaction_ref?: string
  transacted_at?: string
  error?: string
}

const SLIP2GO_BASE = 'https://connect.slip2go.com/api'

// Heuristic: detect slip2go accountType from account number format
// 02001 = PromptPay phone, 02002 = citizen ID, 01004 = bank account
function detectAccountType(account: string): string {
  const digits = account.replace(/\D/g, '')
  if (digits.length === 10 && /^0[6-9]/.test(digits)) return '02001'
  if (digits.length === 13) return '02002'
  return '01004'
}

export async function verifySlip(
  slipImageUrl: string,
  expectedAmount: number,
  expectedAccountNumber: string
): Promise<SlipVerifyResult> {
  return verifyWithSlip2go(slipImageUrl, expectedAmount, expectedAccountNumber)
}

async function verifyWithSlip2go(
  slipImageUrl: string,
  expectedAmount: number,
  expectedAccountNumber: string
): Promise<SlipVerifyResult> {
  const apiKey = process.env.SLIP2GO_API_KEY
  if (!apiKey) throw new Error('SLIP2GO_API_KEY not configured')

  let res: Response
  let data: Record<string, unknown>

  try {
    res = await fetch(`${SLIP2GO_BASE}/verify-slip/qr-image-link/info`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload: {
          imageUrl: slipImageUrl,
          checkCondition: {
            checkDuplicate: true,
            checkAmount: {
              amount: String(expectedAmount),
            },
            checkReceiver: [
              {
                accountType: detectAccountType(expectedAccountNumber),
                accountNumber: expectedAccountNumber,
              },
            ],
          },
        },
      }),
    })
    data = await res.json() as Record<string, unknown>
  } catch (err) {
    console.error('[slip2go] Network/parse error:', err)
    return { success: false, error: 'slip_service_unavailable' }
  }

  const code = String(data.code ?? '')
  const slipData = data.data as Record<string, unknown> | undefined

  switch (code) {
    case '200000':
    case '200200':
      return {
        success: true,
        amount: slipData?.amount as number,
        receiver_account: (slipData?.receiver as Record<string, unknown> | undefined)
          ? String(((slipData?.receiver as Record<string, unknown>)?.account as Record<string, unknown>)?.bank
              ? (((slipData?.receiver as Record<string, unknown>)?.account as Record<string, unknown>)?.bank as Record<string, unknown>)?.account
              : '')
          : undefined,
        transaction_ref: slipData?.transRef as string,
        transacted_at: slipData?.dateTime as string,
      }
    case '200501':
      return { success: false, error: 'duplicate_slip' }
    case '200404':
      return { success: false, error: 'slip_not_found' }
    case '200500':
      return { success: false, error: 'slip_fraud' }
    case '200401':
      return { success: false, error: 'slip_receiver_mismatch' }
    case '200402':
      return { success: false, error: 'slip_amount_mismatch' }
    case '400001':
    case '400004':
      return { success: false, error: 'slip_invalid_image' }
    case '401004':
    case '401005':
    case '401006':
      console.error('[slip2go] Account/package/token issue — code:', code)
      return { success: false, error: 'slip_service_unavailable' }
    default:
      if (code.startsWith('429') || code.startsWith('500')) {
        console.error('[slip2go] Service error — code:', code)
        return { success: false, error: 'slip_service_unavailable' }
      }
      console.error('[slip2go] Unexpected code:', code, data)
      return { success: false, error: 'verification_failed' }
  }
}
