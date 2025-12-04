export const EmailTemplates = {
    WELCOME_NEW_USER: {
        subject: "{appName} - Welcome {firstName}",
        text: `
  Hello {firstName},
  
  Your account has been created on {appName}.
  
  Login email: {email}
  Temporary password: {password}
  
  Please log in and change your password after first login.
  
  If you did not expect this email, please contact your administrator.
  `,
        html: `
  <p>Hello {firstName},</p>
  <p>Your account has been created on <b>{appName}</b>.</p>
  <p>Login email: {email}<br/>
  Temporary password: {password}</p>
  <p>Please log in and change your password after first login.</p>
  <p>If you did not expect this email, please contact your administrator.</p>
  `,
    },

    WELCOME_UPDATED_EMAIL: {
        subject: "{appName} - Your email has been updated",
        text: `
  Hello {firstName},
  
  Your account email has been changed on {appName}.
  
  New login email: {email}
  
  If you did not request this change, please contact your administrator.
  `,
        html: `
  <p>Hello {firstName},</p>
  <p>Your account email has been updated on <b>{appName}</b>.</p>
  <p>New login email: {email}</p>
  <p>If you did not request this change, please contact your administrator.</p>
  `,
    },
};
