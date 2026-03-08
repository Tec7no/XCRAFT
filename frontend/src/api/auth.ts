const API = "http://localhost:5000/auth";

export const sendOtp = async (email: string) => {
  const res = await fetch(`${API}/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  return res.json();
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, otp })
  });

  return res.json();
};

export const signup = async (data: any) => {
  const res = await fetch(`${API}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
};