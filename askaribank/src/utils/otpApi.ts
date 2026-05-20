import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/user`;

export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export type TransferOtpPayload = {
  recipientAccount: string;
  recipientName: string;
  amount: number;
  targetType: string;
  purpose?: string;
  description?: string;
  bankName?: string;
  saveBeneficiary?: boolean;
};

export async function requestTransferOtp(payload: TransferOtpPayload) {
  const { data } = await axios.post(`${API}/generate-otp`, payload, authHeaders());
  return data as {
    success: boolean;
    maskedPhone?: string;
    smsDelivered?: boolean;
    message?: string;
    sessionId?: string;
    code?: string;
    expiresIn?: number;
  };
}

export async function confirmTransferOtp(otp: string) {
  const { data } = await axios.post(`${API}/verify-otp`, { otp }, authHeaders());
  return data as {
    success: boolean;
    transactionId?: string;
    platform?: string;
    transaction?: Record<string, unknown>;
    data?: unknown;
    message?: string;
    attemptsLeft?: number;
    locked?: boolean;
  };
}

export async function getBeneficiaries() {
  const { data } = await axios.get(`${API}/beneficiaries`, authHeaders());
  return data.data as Array<{
    _id: string;
    name: string;
    account: string;
    platform: string;
    bankName?: string;
  }>;
}
