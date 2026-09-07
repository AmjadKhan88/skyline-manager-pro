import { transporter } from "../configs/nodemailer.js";
export const sendEmail = async (to, subject, text)=> {
    try {
    const info = await transporter.sendMail({
      from: `${process.env.GOOGLE_APP_GMAIL}`,
      to,
      subject,
      text,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}