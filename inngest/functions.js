import {inngest} from './client'
import prisma from '@/lib/prisma'

export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'app/user.signedup' },
  async ({ event }) => {
    const { data } = event
    
    // Simulate sending welcome email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Welcome email sent to ${data.email}`);
    
    return { message: `Welcome email sent to ${data.email}` };
  }
);


// Inngest Function to delete coupon on expiry
export const deleteCouponOnExpiry = inngest.createFunction(
    {id: 'delete-coupon-on-expiry'},
    { event: 'app/coupon.expired' },
    async ({ event, step }) => {
        const { data } = event
        const expiryDate = new Date(data.expires_at)
        await step.sleepUntil('wait-for-expiry', expiryDate)

        await step.run('delete-coupon-from-database', async () => {
            await prisma.coupon.delete({
                where: { code: data.code }
            })
        })
    }
)