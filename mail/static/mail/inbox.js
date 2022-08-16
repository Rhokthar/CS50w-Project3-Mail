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
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = "";
  document.querySelector('#compose-subject').value = "";
  document.querySelector('#compose-body').value = "";
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
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

      document.querySelector("#emails-view").append(mailDiv);
    });
  })
}

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
  localStorage.clear();
  load_mailbox("sent");
  return false;
}