

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
  const { admins, requesterName, requesterEmail, equipmentType, utilisateur, department, site, additionalDetails } = req.body;


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'karrassihamza0508@gmail.com',
      pass: 'ejuu ezyn zapq ribj', 
    },
  });

  const emailPromises = admins.map(admin => {
    const mailOptions = {
      from: requesterEmail,
      to: admin,
      subject: 'New Equipment Request',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1a73e8;">New Equipment Request</h2>
          <p><strong>Requester:</strong> ${requesterName} (${requesterEmail})</p>
          <p><strong>Equipment Type:</strong> ${equipmentType}</p>
          <p><strong>User:</strong> ${utilisateur}</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Site/Agence:</strong> ${site}</p>
          <p><strong>Additional Details:</strong> ${additionalDetails}</p>
          
          <hr style="border: 1px solid #1a73e8;" />
          
          <footer style="margin-top: 20px;">
            <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply.</p>
          </footer>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  });

  try {
    await Promise.all(emailPromises);
    res.status(200).send('Emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).send('Failed to send emails');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

