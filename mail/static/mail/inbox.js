document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // SEND MAIL EVENT
  document.querySelector("form").onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector("#email-view").style.display = "none";
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = "";
  document.querySelector('#compose-subject').value = "";
  document.querySelector('#compose-body').value = "";
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector("#email-view").style.display = "none";
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show Emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(mails => {
    console.log(mails);
    mails.forEach(mail => {
      // Vars
      const mailDiv = document.createElement("div");
      const archiveButton = document.createElement("button");
      const replyButton = document.createElement("button");
      
      // Archive & Reply Buttons Styling
      archiveButton.classList.add("btn", "btn-sm", "btn-outline-primary");
      replyButton.classList.add("btn", "btn-sm", "btn-outline-primary");
      if (mailbox === "inbox")
      {
        archiveButton.innerHTML = "Archive";
      }
      else
      {
        archiveButton.innerHTML = "Remove from Archive";
      }
      replyButton.innerHTML = "Reply";
      
      // Div Construction
      mailDiv.innerHTML = `<p>From: <strong>${mail.sender}</strong></p><p>Subject: ${mail.subject}</p><p>${mail.timestamp}</p>`;
      mailDiv.classList.add("email");
      if (mail.read)
      {
        mailDiv.style.backgroundColor = "#ccc";
      }
      else
      {
        mailDiv.style.backgroundColor = "white";
      }

      // Email View Event Listener
      mailDiv.addEventListener("click", () => {
        fetch(`/emails/${mail.id}`)
        .then(response => response.json())
        .then(email => {
          console.log(email);
          
          // E-mail Visualization
          document.querySelector('#emails-view').style.display = "none";
          document.querySelector("#email-view").style.display = "block";
          
          document.querySelector("#email-view").innerHTML = "";

          // Mail Construction
          const mailSubject = document.createElement("div");
          mailSubject.innerHTML = `<p><strong>${email.subject}</strong></p>`;

          const mailSender = document.createElement("div");
          mailSender.innerHTML = `<p>From: ${email.sender}</p>`;

          const mailRecipients = document.createElement("div");
          email.recipients.forEach(recipient => {
            mailRecipients.innerHTML += `<p>To: ${recipient}`;
          });

          const mailTimestamp = document.createElement("div");
          mailTimestamp.innerHTML = `${email.timestamp}`;

          const mailBody = document.createElement("div");
          mailBody.innerHTML = `${email.body}`;

          // Append Email Divs
          document.querySelector("#email-view").append(mailSubject, mailSender, mailRecipients, mailTimestamp, mailBody, replyButton, archiveButton);
          // Archive Button only with Inbox Mails
          if (mailbox !== "inbox" && mailbox !== "archive")
          {
            archiveButton.style.display = "none";
          }

          // Archive Event Listener
          archiveButton.addEventListener("click", () => {
            if (mailbox === "inbox")
            {
              fetch(`/emails/${mail.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
              })
            }
            else
            {
              fetch(`/emails/${mail.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
              })
            }
            load_mailbox("inbox");
          });

          // Reply Event Listener
          replyButton.addEventListener("click", () => {
            compose_email();
            document.querySelector('#compose-recipients').value = email.sender;
            if (!/^Re:/gi.test(email.subject))
            {
              document.querySelector('#compose-subject').value = "Re: " + email.subject;
            }
            else
            {
              document.querySelector('#compose-subject').value = email.subject;
            }
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n${email.body}`;
          });
          
          // Mark Mail as Viewed
          fetch(`/emails/${mail.id}`, {
            method: "PUT",
            body: JSON.stringify({
              read: true
            })
          })
        })
      });

      // Append Divs
      document.querySelector("#emails-view").append(mailDiv);
    });
  })
}

// SEND MAIL FUNCTION STARTS
function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
  // localStorage.clear();
  load_mailbox("sent");
  return false;
}
// SEND MAIL FUNCTION ENDS