import nodemailer from 'nodemailer';
import { ListingModel } from '../modules/listing/listing.models';
import config from '../config';
import { Types } from 'mongoose';
import { UserModel } from '../modules/user/user.models';

export const sendMail = async (listingId: Types.ObjectId, requestStatus: string, tenantId: Types.ObjectId) => {

    const listingData = await ListingModel.findOne(listingId);
    const tenantData = await UserModel.findOne(tenantId);
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: config.node_env === "production",
        auth: {
            user: "rakibul.rupom2001@gmail.com",
            pass: "pmqe zbpf otns egqg",
        },
    });

    const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Request Status Update</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
                .email-container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                .header { font-size: 24px; font-weight: bold; color: #007BFF; margin-bottom: 20px; }
                .content { font-size: 16px; margin-bottom: 20px; }
                .footer { font-size: 14px; color: #777; margin-top: 20px; }
                .button { display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007BFF; border-radius: 5px; text-decoration: none; margin-top: 20px; }
                .button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">Request Status Update</div>
                <div class="content">
                    <p>Hello <strong>${tenantData?.user_name}</strong>,</p>
                    <p>We would like to inform you that the status of your request for the listing at <strong>${listingData?.rentalHouseLocation}</strong> has ${requestStatus}</p>
                    <p>If you have any questions or need further assistance, please feel free to contact us.</p>
                </div>
                <div class="footer">
                    <p>Thank you for using our service.</p>
                    <p>Best regards,<br>House Rent Co.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await transporter.sendMail({
        to: tenantData?.email,
        subject: "Your request has been updated!!!",
        html: emailTemplate,
    });
}