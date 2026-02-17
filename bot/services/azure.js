const axios = require("axios");
const {
    ORGANIZATION,
    PROJECT,
    WORKITEM_ID,
    PARENT_ID,
    PAT_TOKEN,
} = require("../config/config");
const { errorReply } = require("../utils/errorReply");

const AUTH = `Basic ${Buffer.from(`:${PAT_TOKEN}`).toString("base64")}`;

async function createWorkItem(ctx, userData, isNewID) {
    if (!userData.username) {
        ctx.reply(`کاربر یوزرنیم ندارد! 🤖`);
        return;
    }

    // console.log("Creating work item for user:", userData); // Debug log

    try {
        // console.log(ORGANIZATION, PROJECT, WORKITEM_ID); // Debug log

        const res = await axios.get(
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/${WORKITEM_ID}?api-version=7.1-preview.3`,
            { headers: { Authorization: AUTH } }
        );

        // console.log("Original Work Item:", res.data); // Debug log

        const originalWorkItem = res.data;
        const fieldsToCopy = {
            "System.Title": `Entrance Path: @${userData.username} - ${
                (userData.first_name ?? "") + " " + (userData.last_name ?? "")
            }`,
            "System.Description": `<div style="text-align: right;">
تاریخ ورود به گروه: ${new Date(ctx.message.date * 1000).toLocaleString(
                "fa-IR",
                {
                    timeZone: "Asia/Tehran",
                    hour12: false,
                }
            )}
      </div>
      <br/><br/><a style="text-align: right;" href="https://t.me/c/1191433472/${
          ctx.message.message_id
      }">لینک پیام</a></div>`,
            "System.AreaPath": originalWorkItem.fields["System.AreaPath"],
            "System.IterationPath":
                originalWorkItem.fields["System.IterationPath"],
            "Microsoft.VSTS.Common.Priority":
                originalWorkItem.fields["Microsoft.VSTS.Common.Priority"] || 2,
        };

        const payload = Object.entries(fieldsToCopy).map(([key, value]) => ({
            op: "add",
            path: `/fields/${key}`,
            value,
        }));

        payload.push({
            op: "add",
            path: "/relations/-",
            value: {
                rel: "System.LinkTypes.Hierarchy-Reverse",
                url: `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workItems/${PARENT_ID}`,
                attributes: { isLocked: false, name: "Parent" },
            },
        });

        // console.log("Payload for new Work Item:", payload); // Debug log

        await axios.post(
            `https://dev.azure.com/${ORGANIZATION}/${PROJECT}/_apis/wit/workitems/$Product%20Backlog%20Item?api-version=7.1-preview.3`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json-patch+json",
                    Authorization: AUTH,
                },
            }
        );

        if (isNewID) {
            ctx.reply(`سلام @${userData.username}
یوزرنیم شما ثبت شد.

برای آشنایی با فرآیند مصاحبه، لطفاً پیام‌های پین‌شده گروه را مطالعه کنید.
اگر درباره برنامه یا فرآیند مصاحبه سؤالی داشتید، می‌توانید در گروه مطرح کنید؛ خوشحال می‌شویم راهنمایی‌تان کنیم.

موفق باشید🌱`);
        }
    } catch (error) {
        errorReply(ctx, error);
    }
}

module.exports = { createWorkItem };
