package org.choreo.demo.notifications;

import com.azure.communication.email.EmailClient;
import com.azure.communication.email.EmailClientBuilder;
import com.azure.communication.email.models.EmailAddress;
import com.azure.communication.email.models.EmailMessage;
import com.azure.communication.email.models.EmailSendResult;
import com.azure.core.util.polling.SyncPoller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.azure.communication.email.*;
import com.azure.communication.email.models.*;
import com.azure.core.util.polling.PollResponse;
import com.azure.core.util.polling.SyncPoller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/notifications")
@RestController
public class EmailSendController {

    private static final Logger logger = LoggerFactory.getLogger(EmailSendController.class);


    @Value("${azure.comm.services.connection-string}")
    private String azureCommServiceEndpoint;

    @Value("${azure.comm.services.sender-address}")
    private String azureCommServiceSenderAddress;

    @PostMapping("/send-email")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest emailRequest) {
        EmailClient emailClient = new EmailClientBuilder().connectionString(azureCommServiceEndpoint).buildClient();

        EmailAddress toAddress = new EmailAddress(emailRequest.getRecipient());

        EmailMessage emailMessage = new EmailMessage()
                .setSenderAddress(azureCommServiceSenderAddress)
                .setToRecipients(toAddress)
                .setSubject(emailRequest.getSubject())
                .setBodyPlainText(emailRequest.getBody());

        SyncPoller<EmailSendResult, EmailSendResult> poller = emailClient.beginSend(emailMessage, null);
        PollResponse<EmailSendResult> result = poller.waitForCompletion();

        return ResponseEntity.ok("email sent successfully");
    }

    // Define EmailRequest class here or in a separate file
    public static class EmailRequest {
        private String recipient;
        private String subject;
        private String body;

        public String getRecipient() {
            return recipient;
        }

        public void setRecipient(String recipient) {
            this.recipient = recipient;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getBody() {
            return body;
        }

        public void setBody(String body) {
            this.body = body;
        }
    }

}
