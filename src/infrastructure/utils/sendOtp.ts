import axios from 'axios';
import { errorCatch } from '../exception';

export const sendOtp = async (
  baseUrl: string,
  token: string,
  mobile_phone: string,
  message: string,
) => {
  const cleanedPhone = mobile_phone.replace(/\D/g, '');
  try {
    const res = await axios.post(
      `${baseUrl}/message/sms/send`,
      {
        mobile_phone: cleanedPhone,
        message,
        from: '4546',
        callback_url: '',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    console.log(error.message);
    return errorCatch(error);
  }
};
