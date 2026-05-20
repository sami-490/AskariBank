import { useEffect } from 'react';

/**
 * Listens for SMS OTP on Android Chrome (Google Messages autofill via Web OTP API).
 * SMS must end with: @your-domain #123456
 */
export function useSmsOtpAutofill(
  active: boolean,
  onCode: (code: string) => void,
  devCode?: string
) {
  useEffect(() => {
    if (!active || typeof window === 'undefined') {
      return;
    }

    // Dev/Demo Auto-Fill Simulation
    if (devCode && /^\d{6}$/.test(devCode)) {
      const timer = setTimeout(() => {
        onCode(devCode);
      }, 1500); // 1.5s premium micro-delay to show the "waiting for OTP..." UI state
      return () => clearTimeout(timer);
    }

    // Web OTP API for real Android devices
    if (!('OTPCredential' in window)) {
      return;
    }

    const ac = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ['sms'] },
        signal: ac.signal,
      } as CredentialRequestOptions)
      .then((cred) => {
        const otpCred = cred as { code?: string } | null;
        if (otpCred?.code && /^\d{6}$/.test(otpCred.code)) {
          onCode(otpCred.code);
        }
      })
      .catch(() => {
        /* User dismissed or browser unsupported */
      });

    return () => ac.abort();
  }, [active, onCode, devCode]);
}
