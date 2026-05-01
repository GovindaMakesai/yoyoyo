require("dotenv").config();
const { connectDatabase } = require("../config/db");
const { VipPlan } = require("../models/VipPlan");

const plans = [
  {
    code: "vip_monthly",
    name: "VIP Monthly",
    durationDays: 30,
    pricePaise: 19900,
    vipLevel: 1,
    benefits: ["Special badge", "Exclusive emoji", "Broadcast messages", "Enter full rooms"],
  },
  {
    code: "vip_yearly",
    name: "VIP Yearly",
    durationDays: 365,
    pricePaise: 199900,
    vipLevel: 2,
    benefits: ["Special badge", "Exclusive emoji", "Broadcast messages", "Enter full rooms"],
  },
];

const run = async () => {
  await connectDatabase();
  for (const plan of plans) {
    await VipPlan.findOneAndUpdate({ code: plan.code }, plan, { upsert: true, new: true });
  }
  // eslint-disable-next-line no-console
  console.log("VIP plans seeded.");
  process.exit(0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
