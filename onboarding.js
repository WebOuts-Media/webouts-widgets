/* WebOuts Client Onboarding widget, deployed via GitHub + jsDelivr.
 * The Bricks page only holds a tiny loader (see onboarding-loader.html).
 * The page serves the "live" branch, NOT main, so pushing to main changes nothing
 * for clients. Publish with: git push origin main:live --force-with-lease
 * No secrets here; it posts to the public n8n onboarding API. */
(function () {
  var API = "https://webouts.app.n8n.cloud/webhook/onboarding-api";
  var UPLOAD = "https://webouts.app.n8n.cloud/webhook/onboarding-upload";
  var MAX = 10 * 1024 * 1024; // 10 MB per file

  // ---- table definitions (rendered + wired generically) ----
  var TABLES = {
    contacts: { key: 'contacts.list', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'Title / role', ph: 'Practice Manager' },
      { c: 'Email', ph: 'name@org.com' },
      { c: 'Phone', ph: '(555) 555-5555' }
    ] },
    team: { key: 'team.list', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'Title / role', ph: 'Marketing Director' },
      { c: 'Email', ph: 'name@org.com' },
      { c: 'Phone', ph: '(555) 555-5555' }
    ] },
    providers: { key: 'providers.launchList', cols: [
      { c: 'Provider name', ph: 'Dr. Jane Smith' },
      { c: 'Specialty', ph: 'Cardiology' },
      { c: 'Email', ph: 'jane@org.com' },
      // Added after the Northwell schedule asked for "names, specialties, emails
      // and profile links". Rows saved with three values simply leave this blank.
      { c: 'Profile link', ph: 'https://…' }
    ] },
    filmdates: { key: 'filming.preferredDates', cols: [
      { c: 'Preferred date', ph: 'Tue, Oct 28' },
      { c: 'Notes (optional)', ph: 'Morning only' }
    ] },
    resources: { key: 'resources.list', cols: [
      { c: 'What it is', ph: 'e.g. A profile video we love' },
      { c: 'Link', ph: 'https://…' }
    ] },
    billing: { key: 'billing.contacts', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'Title / role', ph: 'Accounts Payable' },
      { c: 'Email', ph: 'ap@org.com' },
      { c: 'Phone', ph: '(555) 555-5555' }
    ] },
    approvals: { key: 'approval.process', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'What they review or approve', ph: 'e.g. Reviews scripts' }
    ], seed: [
      ['', 'Reviews scripts'],
      ['', 'Gives final approval on scripts'],
      ['', 'Reviews videos'],
      ['', 'Gives final approval on videos']
    ] }
  };

  // ---- communication samples shown in section 6 ----
  // Sanitized copies of the real templates. {{tokens}} fill from the form above.
  // Sources: n8n workflows (emails + SMS). The hammer email has no workflow: the
  // client sends it themselves, which is why it carries sentBy + copyable.
  var SAMPLES = [
    {
      "id": "org-kickoff-announcement",
      "channel": "email",
      "stage": "announce",
      "sentBy": "Your organization",
      "audience": "Provider",
      "copyable": true,
      "title": "Kickoff announcement",
      "blurb": "Announces the project and asks each provider to book both appointments.",
      "timing": "At project launch, to every provider",
      "from": "{{sender}}",
      "to": "Dr. {{providerLastName}}",
      "subject": "Action Needed: Schedule Your Physician Profile Video",
      "body": "<p>Hello Dr. {{providerLastName}},</p>\n<p>It is time to schedule your video bio for {{org}}. It will appear on your website profile and the {{org}} YouTube page. Physician video bios can increase patient calls and inquiries by nearly 60%.</p>\n<p>These videos give patients a personal introduction to you before their first visit. They help patients get to know you, understand your care philosophy, and feel more confident reaching out.</p>\n<p>{{org}} has partnered with WebOuts Medical Media, a production company that specializes in healthcare videos.</p>\n<p>Booking your appointments takes just 2 to 3 minutes, and calendar invitations will be sent automatically once scheduled:<br><a href=\"#\">{{bookingLink}}</a></p>\n<p>Please schedule <strong>both</strong> your 20-minute script interview and 1-hour filming appointment. Be sure to choose a filming date that is at least two weeks after your script interview to allow time for script preparation and review.</p>\n<p>A professional writer will use your script interview to prepare a custom script for your review. Filming takes place at {{filmingLocation}} and lasts about one hour. Throughout the process, you will be coached on how to easily and authentically tell your story.</p>\n<p>Example video: <a href=\"#\">{{sampleVideo}}</a></p>\n<p>When scheduling your script call and filming date, please include your practice manager and {{contact}}.</p>"
    },
    {
      "id": "fomo-1",
      "channel": "email",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Scheduling Invite (Stage 1)",
      "blurb": "The opening scheduling invitation, sent once the health system has announced the project.",
      "timing": "First scheduling touch after client intro",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "(Reminder) Schedule Your {{org}} Physician Profile: Script Interview & Filming",
      "body": "<h2>{{org}} Physician Profiles</h2>\n<p>Now booking filming through {{date}}</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>I'm Craig Smoll, President of WebOuts Medical Media. We're honored to work with {{org}}, and over the past 10 years we've helped produce physician profile videos that support patient connection and practice growth.</p>\n\n<p>Please use the link below to schedule your <strong>20-minute script interview</strong> and <strong>1-hour filming</strong> appointment. Just select \"English only\" or \"English &amp; Spanish.\" We're currently booking filming dates through <strong>{{date}}</strong>, so you can reserve a time that fits your schedule weeks ahead.</p>\n\n<p>Filming takes place at {{filmingLocation}}, and you'll be coached throughout. Our team will follow up with reminders and next steps.</p>\n\n<p>If someone on your team handles scheduling, feel free to forward this email so they can book on your behalf.</p>\n\n<div class=\"wo-ml-card\">\n  <ul>\n    <li><strong>WHAT</strong> A <strong>20-minute phone call script interview</strong> plus a <strong>1-hour filming session</strong></li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n    <li><strong>WHEN</strong> {{date}}</li>\n    <li><strong>NOTE</strong> Choose a filming date at least <strong>two weeks</strong> after your script interview, so there is time for script prep and review.</li>\n  </ul>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Schedule Interview &amp; Filming</a></p>\n<p>Pick \"English only\" or \"English &amp; Spanish.\" Calendar invites arrive right away.</p>\n\n<p>Questions? Just reply to this email.</p>\n\n<p><strong>Craig Smoll</strong><br>President, WebOuts Medical Media</p>"
    },
    {
      "id": "fomo-2",
      "channel": "email",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Slots Remaining (Stage 2)",
      "blurb": "First nudge for providers who have not booked, leading with remaining filming slots.",
      "timing": "Next scheduling run after the invite",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "Quick Update: Only a Few Filming Slots Remain for {{date}}",
      "body": "<h2>Filming Slots Remaining</h2>\n<p>Filming {{date}}</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Only a limited number of filming slots remain for {{org}} physician profile filming on <strong>{{date}}</strong>.</p>\n\n<p>Knowing how quickly physicians' schedules fill, we invite you to use the link below to secure one of the remaining slots that's convenient for you.</p>\n\n<p>If someone on your team handles scheduling, feel free to forward this email so they can book on your behalf.</p>\n\n<div class=\"wo-ml-card\">\n  <ul>\n    <li><strong>WHAT</strong> A <strong>20-minute phone call script interview</strong> plus a <strong>1-hour filming session</strong></li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n    <li><strong>WHEN</strong> {{date}}</li>\n    <li><strong>NOTE</strong> Choose a filming date at least <strong>two weeks</strong> after your script interview, so there is time for script prep and review.</li>\n  </ul>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Schedule Interview &amp; Filming</a></p>\n\n<p>Questions? Just reply to this email.</p>\n\n<p><strong>Craig Smoll</strong><br>President, WebOuts Medical Media</p>"
    },
    {
      "id": "fomo-3",
      "channel": "email",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Dates Filling Up (Stage 3)",
      "blurb": "Shows which filming dates peers have already filled and which are still open.",
      "timing": "Third scheduling touch, roughly a week later",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "(Quick Update) {{org}} Profile Filming: Some Dates Filled, Some Still Open",
      "body": "<h2>Filming Slots Remaining</h2>\n<p>Filming {{date}}</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Due to a strong scheduling response from your fellow {{org}} doctors, several filming dates are now filled. The good news: we still have filming slots remaining for <strong>{{date}}</strong>.</p>\n\n<p>We invite you to take three minutes to choose one of the remaining slots before they're filled.</p>\n\n<p>If someone on your team handles scheduling, feel free to forward this email so they can book on your behalf.</p>\n\n<div class=\"wo-ml-card\">\n  <ul>\n    <li><strong>WHAT</strong> A <strong>20-minute phone call script interview</strong> plus a <strong>1-hour filming session</strong></li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n    <li><strong>WHEN</strong> {{date}}</li>\n    <li><strong>NOTE</strong> Choose a filming date at least <strong>two weeks</strong> after your script interview, so there is time for script prep and review.</li>\n  </ul>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Schedule Interview &amp; Filming</a></p>\n\n<p>Questions? Just reply to this email.</p>\n\n<p><strong>Craig Smoll</strong><br>President, WebOuts Medical Media</p>"
    },
    {
      "id": "fomo-4",
      "channel": "email",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Time Sensitive (Stage 4)",
      "blurb": "Time sensitive nudge once the schedule is down to its last handful of filming slots.",
      "timing": "Fourth scheduling touch, slots nearly gone",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "(Time Sensitive) Down to the Final {{org}} Filming Slots",
      "body": "<h2>Filming Slots Remaining</h2>\n<p>Filming {{date}}</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>We're down to the final filming slots for {{org}} physician profile filming. Spots are going fast. Booking takes under a minute, and your calendar invitations arrive right away.</p>\n\n<p>If someone on your team handles scheduling, feel free to forward this email so they can book on your behalf.</p>\n\n<div class=\"wo-ml-card\">\n  <ul>\n    <li><strong>WHAT</strong> A <strong>20-minute phone call script interview</strong> plus a <strong>1-hour filming session</strong></li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n    <li><strong>WHEN</strong> {{date}}</li>\n    <li><strong>NOTE</strong> Choose a filming date at least <strong>two weeks</strong> after your script interview, so there is time for script prep and review.</li>\n  </ul>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Schedule Interview &amp; Filming</a></p>\n\n<p>Questions? Just reply to this email.</p>\n\n<p><strong>Craig Smoll</strong><br>President, WebOuts Medical Media</p>"
    },
    {
      "id": "fomo-5",
      "channel": "email",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Final Reminder (Stage 5)",
      "blurb": "Last scheduling email before the provider is handed back to health system leadership.",
      "timing": "Final touch before escalation to leadership",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "Final reminder: schedule your {{org}} profile video",
      "body": "<h2>Filming Slots Remaining</h2>\n<p>Filming {{date}}</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>This is our final reminder about your {{org}} physician profile video. If we don't hear from you, we'll hand scheduling back to {{org}} leadership, who will follow up with you and your admin directly. <strong>Slots are still open</strong> if you'd like to grab one.</p>\n\n<p>If someone on your team handles scheduling, feel free to forward this email so they can book on your behalf.</p>\n\n<div class=\"wo-ml-card\">\n  <ul>\n    <li><strong>WHAT</strong> A <strong>20-minute phone call script interview</strong> plus a <strong>1-hour filming session</strong></li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n    <li><strong>WHEN</strong> {{date}}</li>\n    <li><strong>NOTE</strong> Choose a filming date at least <strong>two weeks</strong> after your script interview, so there is time for script prep and review.</li>\n  </ul>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Schedule Interview &amp; Filming</a></p>\n\n<p>Questions? Just reply to this email.</p>\n\n<p><strong>Craig Smoll</strong><br>President, WebOuts Medical Media</p>"
    },
    {
      "id": "both-bookings-confirmed",
      "channel": "sms",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Both bookings confirmed",
      "blurb": "Confirms the provider is fully booked once interview and filming are both on the calendar.",
      "timing": "First time both interview and filming dates are set",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, you're all set. Your script interview and filming are both booked. Check your inbox for the calendar invites."
    },
    {
      "id": "cam-concierge-intro",
      "channel": "email",
      "stage": "kickoff",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Concierge Intro",
      "blurb": "Arrives minutes after a provider books, introducing their personal point of contact.",
      "timing": "Immediately after booking is confirmed",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "A quick hello from your {{org}} Physician Profile concierge",
      "body": "<h2>You're Booked, and in Good Hands</h2>\n<p>A personal hello from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Hi, I'm <strong>Cam Kubasta</strong> with WebOuts Medical Media. Now that your {{org}} script interview and filming are on the calendar, I wanted to introduce myself. Think of me as your {{org}} Physician Profile concierge.</p>\n\n<p>My goal is simple: to make this process completely effortless for you. If a question comes up or you just want to talk something through, reach out anytime. I'm always glad to help.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR APPOINTMENTS</strong></p>\n  <ul>\n    <li><strong>SCRIPTING</strong> {{date}} at {{time}}</li>\n    <li><strong>FILMING</strong> {{date}} at {{time}}, {{filmingLocation}}</li>\n  </ul>\n  <p>Times shown in your local timezone.</p>\n</div>\n\n<p>Most of all, whatever you need along the way, consider me your direct line.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>MY CONTACT INFORMATION</strong></p>\n  <p>Call or text me anytime.</p>\n  <p>Email: <a href=\"#\">ckubasta@webouts.com</a></p>\n</div>\n\n<p>Looking forward to working with you,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media</p>"
    },
    {
      "id": "crew-showcase-interview-week",
      "channel": "email",
      "stage": "interview",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Script Interview One Week Out",
      "blurb": "Sets expectations for the script interview and introduces the writer a week ahead.",
      "timing": "Seven days before the script interview",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "Your {{org}} Script Interview Is One Week Away: Where Your Video Begins",
      "body": "<h2>Your Script Interview Is One Week Away</h2>\n<p>A note from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Your script interview is <strong>one week away</strong>. This is a relaxed, 20-minute phone call designed to capture how you naturally speak with patients and create a profile script that feels authentic to you.</p>\n\n<p>No preparation, writing, or rehearsal is needed. The call is recorded so our writing team can preserve your speaking style, perspective, and personality, which we think of as your unique \"fingerprint,\" in a polished script of approximately 225 words for your review.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR SCRIPT INTERVIEW</strong></p>\n  <ul>\n    <li><strong>WHEN</strong> {{interviewDate}} at {{interviewTime}}</li>\n    <li><strong>HOW</strong> A relaxed phone conversation. We will call you at the mobile number you provided.</li>\n  </ul>\n</div>\n\n<p><strong>Meet your interviewer</strong></p>\n<div class=\"wo-ml-people\">\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/role-generic-crew-navy.png\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">Your script writer</span><span class=\"wo-ml-pr\">WebOuts Medical Media</span></div><div class=\"wo-ml-pb\">Your script writer will guide you through straightforward questions about how you care for patients and what you want them to understand before choosing you.</div></div></div>\n</div>\n\n<div class=\"wo-ml-card\">\n  <p><strong>One thing worth knowing:</strong> your script, your filming day, and your finished video all build from this one conversation. A cancellation pushes back the tool that helps new patients find you, choose you, and build your practice. Your community is waiting to meet you, and so are we.</p>\n</div>\n\n<p>Have a question? Just reply to this email.</p>\n\n<p>We can't wait to hear your story,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media<br><a href=\"#\">ckubasta@webouts.com</a></p>"
    },
    {
      "id": "interview-one-week-away",
      "channel": "sms",
      "stage": "interview",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Interview one week away",
      "blurb": "A week out, sets expectations that the script interview is a relaxed phone call.",
      "timing": "Exactly seven days before the script interview",
      "body": "Hi Dr. {{providerLastName}}, it's the WebOuts team. Your script interview is one week away: {{interviewDate}} at {{interviewTime}}. It's a relaxed phone call, and it's where your profile video begins. We'll call you at this number. Questions? Just reply here."
    },
    {
      "id": "crew-showcase-interview-tomorrow",
      "channel": "email",
      "stage": "interview",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Script Interview Tomorrow",
      "blurb": "Brief day-before note with call details and one tip for answering naturally.",
      "timing": "The day before the script interview",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "Reminder: Your Script Interview Is Tomorrow",
      "body": "<h2>Your Script Interview Is Tomorrow</h2>\n<p>A note from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Your script interview is <strong>tomorrow</strong>. This is a relaxed, 20-minute phone call designed to capture how you naturally speak with patients and create a profile script that feels authentic to you.</p>\n\n<p>No preparation, writing, or rehearsal is needed. Just answer naturally, and we will take it from there.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR SCRIPT INTERVIEW</strong></p>\n  <ul>\n    <li><strong>WHEN</strong> {{interviewDate}} at {{interviewTime}}</li>\n    <li><strong>HOW</strong> A relaxed phone conversation. We will call you at the mobile number you provided.</li>\n  </ul>\n</div>\n\n<div class=\"wo-ml-card\">\n  <p><strong>One tip before we talk:</strong> answer as if a patient just asked you the question. Your script is built from your own words on this call, so the way you naturally explain things to your patients is exactly what we're listening for.</p>\n</div>\n\n<p><strong>Meet your interviewer</strong></p>\n<div class=\"wo-ml-people\">\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/role-generic-crew-navy.png\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">Your script writer</span><span class=\"wo-ml-pr\">WebOuts Medical Media</span></div><div class=\"wo-ml-pb\">Your script writer will guide you through straightforward, patient-focused questions and make the call feel easy from start to finish.</div></div></div>\n</div>\n\n<p>We can't wait to hear your story,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media<br><a href=\"#\">ckubasta@webouts.com</a></p>"
    },
    {
      "id": "interview-tomorrow",
      "channel": "sms",
      "stage": "interview",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Interview tomorrow",
      "blurb": "Day-before reminder for the script interview, with one tip on how to answer.",
      "timing": "The day before the script interview",
      "body": "Hi Dr. {{providerLastName}}, it's the WebOuts team. Your script interview is tomorrow at {{interviewTime}}, and we'll call you. No preparation needed, and one tip: answer like a patient just asked you the question. Your own words become your script. Talk soon!"
    },
    {
      "id": "interview-date-updated",
      "channel": "sms",
      "stage": "interview",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Interview date updated",
      "blurb": "Tells the provider their script interview moved and a fresh invite is on the way.",
      "timing": "When the script interview date changes after booking",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, your script interview date has been updated. A new calendar invite has been sent to your inbox."
    },
    {
      "id": "draft-script-to-provider",
      "channel": "email",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Draft Script for Review",
      "blurb": "Delivers the first draft of the provider script and asks for approval or edits.",
      "timing": "When the draft script is ready for review",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "Profile Script - Draft from WebOuts Medical Media",
      "body": "<h2>Physician Profile Script Draft</h2>\n<p>Please review the draft below.</p>\n\n<p><strong>Hello {{provider}},</strong></p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>IMPORTANT: Scripts need to be approved at least 1 week before filming.</strong></p>\n</div>\n\n<div class=\"wo-ml-card\">\n  <p><strong>Next step</strong></p>\n  <ul>\n    <li><strong>No edits needed:</strong> click the <strong>Script Approved</strong> button below.</li>\n    <li><strong>Need edits:</strong> reply with your changes and <strong>your script writer</strong> will send an updated version.</li>\n  </ul>\n  <p><strong>Key points</strong></p>\n  <ul>\n    <li><strong>Make it personal:</strong> the profile should feel personal and reflect you as a person and provider.</li>\n    <li><strong>References:</strong> please do not reference external organizations.</li>\n    <li><strong>Length:</strong> scripts must be 225 words or less (about 90 seconds).</li>\n  </ul>\n</div>\n\n<p><strong>Draft script</strong></p>\n\n<div class=\"wo-ml-card\">\n  <p>Your draft script appears here, exactly as your writer prepared it.</p>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Script Approved</a></p>\n\n<p><strong>Important training video (6 minutes)</strong></p>\n<p>Attire tips and best practices for a smooth recording.</p>\n<p><a class=\"wo-ml-btn\" href=\"#\">Watch the 6-minute prep video</a></p>\n\n<p>Thank you,</p>\n<p><strong>WebOuts Medical Media Team</strong></p>"
    },
    {
      "id": "draft-script-sent",
      "channel": "sms",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Draft script sent",
      "blurb": "Goes out the moment the draft script email lands, so it does not sit unopened.",
      "timing": "When the draft script email is sent",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, your profile script draft is in your inbox and ready for review."
    },
    {
      "id": "script-approval-reminder",
      "channel": "email",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Script Approval Reminder",
      "blurb": "Automatic nudge when a script is still unapproved ten days out from filming.",
      "timing": "Ten days before filming",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "Action Needed: Approve & Lock Your Physician Profile Script",
      "body": "<h2>Action Needed: Approve Your Script</h2>\n<p>Your filming is about <strong>10 days</strong> away. Scripts must be approved and locked no later than <strong>7 days before filming</strong>.</p>\n\n<p><strong>Hello {{provider}},</strong></p>\n\n<p>Your physician bio video script is ready below. It has already been reviewed and approved by the {{org}} communications team. We just need your sign-off to lock it in before filming.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR ACTION ITEM</strong></p>\n  <p><strong>No edits needed?</strong> Click the <strong>Script Approved</strong> button below. <strong>Need a change?</strong> Just reply to this email and your scriptwriter will take care of it.</p>\n</div>\n\n<p><strong>Your script</strong></p>\n\n<div class=\"wo-ml-card\">\n  <p>Your current script appears here for a final read-through.</p>\n</div>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Script Approved</a></p>\n\n<p>Thank you,</p>\n<p><strong>The WebOuts Scripting Team</strong><br>WebOuts Medical Media</p>"
    },
    {
      "id": "approval-reminder-1-week",
      "channel": "sms",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Approval reminder, 1 week out",
      "blurb": "A week before filming, reminds the provider to review and approve their script.",
      "timing": "One week before the filming date",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, your filming session is coming up soon. Please review and approve your script if you haven't yet."
    },
    {
      "id": "approval-due-tomorrow",
      "channel": "sms",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Approval due tomorrow",
      "blurb": "Last call on script approval, with a clear default if we do not hear back.",
      "timing": "One day before the approval deadline",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, your script approval is due tomorrow. If we don't hear back we'll proceed with the current version into filming prep. Just reply or check your inbox if you'd like any changes."
    },
    {
      "id": "approval-nudge-5-days-after",
      "channel": "sms",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Approval nudge, 5 days after",
      "blurb": "A light follow-up when a script draft has been waiting on approval for five days.",
      "timing": "Five days after the draft was sent with no reply",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, a friendly nudge: your script draft from last week is still waiting for your approval whenever you have a moment. It's in your inbox, or reply here with any questions."
    },
    {
      "id": "final-script-to-provider",
      "channel": "email",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Final Approved Script",
      "blurb": "Sends the locked, final script so the provider can practice before filming day.",
      "timing": "Once the script is approved and locked",
      "from": "WebOuts Medical Media <scripting@webouts.com>",
      "subject": "Profile Script - Final from WebOuts Medical Media",
      "body": "<h2>Physician Profile Script - Final Approved</h2>\n\n<p><strong>Hello {{provider}},</strong></p>\n\n<p>Below is your <strong>final approved</strong> physician bio video script.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>What happens next</strong></p>\n  <ul>\n    <li>Practice your script out loud so the pacing feels comfortable and conversational.</li>\n    <li>Please watch the 6-minute prep video below for attire tips and best practices for a smooth recording.</li>\n  </ul>\n</div>\n\n<p><strong>Final approved script</strong></p>\n\n<div class=\"wo-ml-card\">\n  <p>Your final approved script appears here, ready to practice.</p>\n</div>\n\n<p><strong>Important training video (6 minutes)</strong></p>\n<p>Attire tips and best practices for a smooth recording.</p>\n<p><a class=\"wo-ml-btn\" href=\"#\">Watch the 6-minute prep video</a></p>\n\n<p>Thank you,</p>\n<p><strong>WebOuts Medical Media Team</strong></p>"
    },
    {
      "id": "final-script-sent",
      "channel": "sms",
      "stage": "script",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Final script sent",
      "blurb": "Lets the provider know the final script is ready and nudges them to rehearse it.",
      "timing": "When the final script email is sent",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, your final script has been sent to your inbox. Practicing it aloud a few times before filming will help you feel confident on camera."
    },
    {
      "id": "training-video-nudge",
      "channel": "sms",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Training video nudge",
      "blurb": "Sent ahead of filming so the provider knows the team and walks in prepared.",
      "timing": "When training reminder is turned on for a provider",
      "body": "WebOuts: Meet the team and prep for a confident shoot. Watch our 6-min training: {{link}}"
    },
    {
      "id": "filming-training-reminder-7day",
      "channel": "email",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Training Reminder, One Week Out",
      "blurb": "Points the provider to the six-minute prep video a week before filming day.",
      "timing": "Seven days before filming",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "Your {{org}} Filming Is One Week Away",
      "body": "<h2>Your Filming Is One Week Away</h2>\n<p>A quick reminder from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Just a reminder that your physician bio video filming is <strong>in one week</strong>. To help you feel confident and camera-ready, please take six minutes to watch our physician profile training video. You will meet Craig Smoll, see exactly what to expect on set, and pick up a few simple tips to ease any nerves.</p>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Watch the 6-Minute Training Video</a></p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR FILMING</strong></p>\n  <ul>\n    <li><strong>WHEN</strong> {{date}} at {{time}}</li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n  </ul>\n  <p>Time shown in your local timezone.</p>\n</div>\n\n<p>See you on set,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media<br><a href=\"#\">ckubasta@webouts.com</a></p>"
    },
    {
      "id": "crew-showcase-filming-week",
      "channel": "email",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Meet Your Film Team",
      "blurb": "Introduces the crew assembled for the shoot one week before filming day.",
      "timing": "Seven days before filming",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "Your {{org}} Filming Is One Week Away: Meet Your Film Team",
      "body": "<h2>Your Filming Is One Week Away</h2>\n<p>A note from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Your filming is <strong>one week away</strong>. Patients who engage with a provider profile video are more than 60% more likely to call or click to schedule an appointment. That means your video is not just an introduction. It is a practice-building tool that helps patients feel more confident choosing you and taking the next step.</p>\n\n<p>A dedicated production team has already been contracted and coordinated around your 1-hour filming session, including coaching, camera, lighting, hair and makeup, and production support. Because this production time is built specifically around your appointment, we appreciate you making every effort to keep this time set aside.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR FILMING</strong></p>\n  <ul>\n    <li><strong>WHEN</strong> {{date}} at {{time}}</li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n  </ul>\n</div>\n\n<p><strong>Your {{org}} contact</strong></p>\n<div class=\"wo-ml-people\">\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/role-generic-crew-orange.png\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">{{contact}}</span><span class=\"wo-ml-pr\">{{org}}</span></div><div class=\"wo-ml-pb\">Your marketing contact for filming day, there to help make sure everything runs smoothly.</div></div></div>\n</div>\n\n<p><strong>Meet the team we have assembled for your shoot</strong></p>\n<p>Each member was hand-picked for your profile. Here is who is taking care of you, on set and behind the scenes:</p>\n<div class=\"wo-ml-people\">\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/craig-smoll-headshot-320.jpg\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">Craig Smoll</span><span class=\"wo-ml-pr\">Co-Owner / Filming Coach</span></div><div class=\"wo-ml-pb\">Craig brings 20+ years of healthcare-specific filming experience and will coach you through the process so you feel natural, confident, and comfortable on camera.</div></div></div>\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/role-hair-makeup-navy.png\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">Your stylist</span><span class=\"wo-ml-pr\">Hair &amp; Makeup</span></div><div class=\"wo-ml-pb\">Your stylist brings years of professional hair and makeup experience for camera and will help you look natural, polished, and camera-ready.</div></div></div>\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/cam-kubasta-headshot-320.jpg\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">Cam Kubasta</span><span class=\"wo-ml-pr\">Production Coordinator</span></div><div class=\"wo-ml-pb\">Cam handles the pre-production details, scheduling, and white-glove coordination leading up to filming so your experience is organized, simple, and smooth from start to finish.</div></div></div>\n  <div class=\"wo-ml-person\"><img class=\"wo-ml-av\" src=\"https://webouts.com/wp-content/uploads/2026/07/andy-denure-headshot-320.jpg\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\"><div><div><span class=\"wo-ml-pn\">Andy DeNure</span><span class=\"wo-ml-pr\">Co-Owner / Director of Photography</span></div><div class=\"wo-ml-pb\">Andy brings 25+ years of production experience and oversees the technical side of filming, including camera, lighting, audio, and the WebOuts remote filming systems.</div></div></div>\n</div>\n\n<div class=\"wo-ml-card\">\n  <p><strong>One thing worth knowing:</strong> your film team isn't part of the {{org}} staff. Each member is dedicated to your profile video, whether they're on set with you or supporting your production behind the scenes. A cancellation doesn't just carry a real cost for {{org}}. It delays the tool that helps new patients find you, choose you, and build your practice. Your community is waiting to meet you, and so are we.</p>\n</div>\n\n<p>No preparation needed. Your film coach will guide you through everything on the day. Have a question? Just reply to this email.</p>\n\n<p>We can't wait to see you on camera,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media<br><a href=\"#\">ckubasta@webouts.com</a></p>"
    },
    {
      "id": "filming-one-week-away",
      "channel": "sms",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Filming one week away",
      "blurb": "A week out, confirms the filming details and builds anticipation for the shoot.",
      "timing": "Exactly seven days before the filming date",
      "body": "Hi Dr. {{providerLastName}}, it's the WebOuts team. Your profile video filming is one week away: {{date}} at {{time}}, {{filmingLocation}}. We've hand-picked a film team dedicated to your video, and your community is waiting to meet you. Full details are in your email. Questions? Just reply here."
    },
    {
      "id": "filming-training-reminder-1day",
      "channel": "email",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Training Reminder, Day Before",
      "blurb": "Last-minute prep reminder with the training video, timing, and filming location.",
      "timing": "The day before filming",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "Reminder: Your {{org}} Filming Is Tomorrow",
      "body": "<h2>Your Filming Is Tomorrow</h2>\n<p>A quick reminder from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Just a reminder that your physician bio video filming is <strong>tomorrow</strong>. To help you feel confident and camera-ready, please take six minutes to watch our physician profile training video. You will meet Craig Smoll, see exactly what to expect on set, and pick up a few simple tips to ease any nerves.</p>\n\n<p><a class=\"wo-ml-btn\" href=\"#\">Watch the 6-Minute Training Video</a></p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR FILMING</strong></p>\n  <ul>\n    <li><strong>WHEN</strong> {{date}} at {{time}}</li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n  </ul>\n  <p>Time shown in your local timezone.</p>\n</div>\n\n<p>See you on set,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media<br><a href=\"#\">ckubasta@webouts.com</a></p>"
    },
    {
      "id": "crew-showcase-filming-tomorrow",
      "channel": "email",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Your Team Is Ready",
      "blurb": "Short day-before note with logistics and a photo strip of the crew who will be there.",
      "timing": "The day before filming",
      "from": "Cam Kubasta <ckubasta@webouts.com>",
      "subject": "Reminder: Your Filming Is Tomorrow and Your Team Is Ready",
      "body": "<h2>Your Filming Is Tomorrow</h2>\n<p>A note from your WebOuts Media team</p>\n\n<p><strong>{{provider}},</strong></p>\n\n<p>Your filming is <strong>tomorrow</strong>. A professional production team has already been contracted and coordinated around your 1-hour session, so we appreciate you keeping this time protected.</p>\n\n<p>During your appointment, we'll coach you through creating a provider profile video that makes a real difference for patients deciding who to trust with their care. Patients who engage with a provider profile video are more than 60% more likely to call or click to schedule an appointment, making this a powerful practice-building tool.</p>\n\n<div class=\"wo-ml-card\">\n  <p><strong>YOUR FILMING</strong></p>\n  <ul>\n    <li><strong>WHEN</strong> {{date}} at {{time}}</li>\n    <li><strong>WHERE</strong> {{filmingLocation}}</li>\n  </ul>\n</div>\n\n<p><strong>Your team is ready</strong></p>\n<div class=\"wo-ml-strip\">\n  <div class=\"wo-ml-sp\"><img src=\"https://webouts.com/wp-content/uploads/2026/07/role-generic-crew-orange.png\" alt=\"\" width=\"60\" height=\"60\" loading=\"lazy\"><div class=\"wo-ml-sn\">{{contact}}</div><div class=\"wo-ml-sr\">{{org}}</div></div>\n  <div class=\"wo-ml-sp\"><img src=\"https://webouts.com/wp-content/uploads/2026/07/craig-smoll-headshot-320.jpg\" alt=\"\" width=\"60\" height=\"60\" loading=\"lazy\"><div class=\"wo-ml-sn\">Craig Smoll</div><div class=\"wo-ml-sr\">Co-Owner / Filming Coach</div></div>\n  <div class=\"wo-ml-sp\"><img src=\"https://webouts.com/wp-content/uploads/2026/07/role-hair-makeup-navy.png\" alt=\"\" width=\"60\" height=\"60\" loading=\"lazy\"><div class=\"wo-ml-sn\">Your stylist</div><div class=\"wo-ml-sr\">Hair &amp; Makeup</div></div>\n  <div class=\"wo-ml-sp\"><img src=\"https://webouts.com/wp-content/uploads/2026/07/cam-kubasta-headshot-320.jpg\" alt=\"\" width=\"60\" height=\"60\" loading=\"lazy\"><div class=\"wo-ml-sn\">Cam Kubasta</div><div class=\"wo-ml-sr\">Production Coordinator</div></div>\n  <div class=\"wo-ml-sp\"><img src=\"https://webouts.com/wp-content/uploads/2026/07/andy-denure-headshot-320.jpg\" alt=\"\" width=\"60\" height=\"60\" loading=\"lazy\"><div class=\"wo-ml-sn\">Andy DeNure</div><div class=\"wo-ml-sr\">Co-Owner / Director of Photography</div></div>\n</div>\n\n<p>We can't wait to see you on camera,</p>\n\n<p><strong>Cam Kubasta</strong><br>Pre-Production Coordinator, WebOuts Medical Media<br><a href=\"#\">ckubasta@webouts.com</a></p>"
    },
    {
      "id": "filming-tomorrow",
      "channel": "sms",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Filming tomorrow",
      "blurb": "Day-before reminder that removes prep anxiety and locks in attendance.",
      "timing": "The day before the filming date",
      "body": "Hi Dr. {{providerLastName}}, it's the WebOuts team. Your filming is tomorrow at {{time}}, {{filmingLocation}}. Your team is ready and it can't happen without you. Come as you are: hair, makeup, and coaching are all taken care of. See you tomorrow!"
    },
    {
      "id": "filming-date-updated",
      "channel": "sms",
      "stage": "filming",
      "sentBy": "WebOuts",
      "audience": "Provider",
      "title": "Filming date updated",
      "blurb": "Tells the provider their filming date moved and a fresh invite is on the way.",
      "timing": "When the filming date changes after booking",
      "body": "WebOuts: Hi Dr. {{providerLastName}}, your filming date has been updated. A new calendar invite has been sent to your inbox."
    },
    {
      "id": "leadership-filming-reminder",
      "channel": "email",
      "stage": "client-sent",
      "sentBy": "Your organization",
      "audience": "Provider",
      "copyable": true,
      "title": "Leadership filming reminder",
      "blurb": "Your leadership sends this so providers treat the filming date as a priority.",
      "timing": "Less than one week before filming",
      "from": "{{sender}}",
      "to": "Dr. {{providerLastName}}",
      "subject": "Important Reminder: Your Physician Profile Filming Is Confirmed for {{date}}",
      "body": "<p>Dr. {{providerLastName}},</p>\n<p>Your physician profile filming is less than one week away. This 1-hour session creates a long-term practice-building tool that helps patients connect with you, build trust in {{org}}, and feel confident calling or clicking to schedule an appointment.</p>\n<p>Patients who watched a provider profile video were more than 60% more likely to call or click to schedule an appointment than those who did not. Your video also gives patients a personal introduction to you and {{org}} before their first visit.</p>\n<p>A professional production team has already been contracted, and dedicated resources have been coordinated around your appointment. Last-minute cancellations or rescheduling create real production costs and delay when your video can begin supporting your practice.</p>\n<p>Please make every effort to attend your appointment as scheduled. Our team will guide you through the entire session and make the filming process comfortable, efficient, and easy.</p>\n<p>If you have any questions or concerns before filming, please reach out. Our team is looking forward to working with you on set.</p>"
    }
  ];

  var STYLE = `
  /* Fluid rather than a fixed 720: the provider and contact tables were cramped on a
     laptop while there was empty page either side. Scales with the viewport, capped so
     help text never runs to an unreadable measure. */
  /* border-box is load-bearing: with content-box the 16px side padding is added on top
     of the 94vw cap, which overflowed the viewport sideways on a phone. */
  #wo-onb{width:100%;max-width:min(980px,94vw);box-sizing:border-box;margin:0 auto;padding:8px 16px 72px;font-family:'Poppins',Arial,Helvetica,sans-serif;color:#1f2430;line-height:1.5}
  #wo-onb h1{color:#07378C;font-size:27px;font-weight:800;margin:6px 0 6px;letter-spacing:-.4px;text-align:center}
  #wo-onb .sub{color:#5b6472;font-size:15px;margin:0 auto 22px;max-width:60ch;text-align:center}

  /* resume card (save state + private link) */
  #wo-onb .bar{position:sticky;top:0;z-index:5;background:#fff;border:2px solid #E26337;border-radius:12px;box-shadow:0 4px 16px rgba(226,99,55,.15);padding:12px 14px;margin:0 0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  #wo-onb .save{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#4b5563;white-space:nowrap}
  #wo-onb .dot{width:9px;height:9px;border-radius:50%;background:#9ca3af;flex:0 0 auto}
  #wo-onb .dot.saved{background:#2F8F5C;box-shadow:0 0 0 3px rgba(47,143,92,.18)}
  #wo-onb .dot.saving{background:#E2A24B;box-shadow:0 0 0 3px rgba(226,162,75,.18)}
  #wo-onb .dot.error{background:#c0392b;box-shadow:0 0 0 3px rgba(192,57,43,.18)}
  #wo-onb .linkwrap{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 260px}
  #wo-onb .linklabel{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#8a93a3}
  #wo-onb .linkbox{font-size:12.5px;color:#07378C;background:#f2f6ff;border:1px solid #d6e3ff;border-radius:7px;padding:7px 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #wo-onb .copy{background:#07378C;color:#fff;flex:0 0 auto}
  #wo-onb .copy:hover{filter:brightness(1.1)}
  /* progress lives on its own full-width row inside the sticky bar (flex-basis 100%),
     so it never fights the link box for space and stays visible while scrolling. */
  #wo-onb .prog{flex:1 1 100%;display:flex;align-items:center;gap:10px;margin-top:2px}
  #wo-onb .progtrack{flex:1;height:6px;background:#eef2f8;border-radius:99px;overflow:hidden}
  #wo-onb .progfill{display:block;height:100%;width:0;background:#2F8F5C;border-radius:99px;transition:width .3s ease}
  #wo-onb .progtxt{font-size:12px;font-weight:600;color:#4b5563;white-space:nowrap}

  /* sections */
  #wo-onb .sec{border:1px solid #e6e9ef;border-radius:12px;padding:20px 22px;margin:0 0 14px;background:#fff}
  #wo-onb .sec h2{display:flex;align-items:center;gap:11px;color:#07378C;font-size:17px;font-weight:700;margin:0 0 4px;width:100%;max-width:none;box-sizing:border-box}
  #wo-onb .num{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#07378C;color:#fff;font-size:13px;font-weight:700;flex:0 0 auto}
  #wo-onb .intro{color:#5b6472;font-size:13.5px;margin:0 0 16px 37px}
  #wo-onb .secbody{margin-top:16px}
  #wo-onb .fld{margin:0 0 16px}
  #wo-onb .fld:last-child{margin-bottom:0}
  #wo-onb label{display:block;font-weight:600;font-size:14px;margin:0 0 5px;color:#E26337}
  #wo-onb .help{color:#6b7280;font-size:12.5px;margin:0 0 7px;line-height:1.5}
  #wo-onb .help strong{color:#4b5563}
  #wo-onb input[type=text],#wo-onb input[type=email],#wo-onb input[type=tel],#wo-onb textarea{
    width:100%;box-sizing:border-box;border:1px solid #d3d8e0;border-radius:9px;padding:11px 13px;font-size:14px;font-family:inherit;color:#1f2430;background:#fff}
  #wo-onb input::placeholder,#wo-onb textarea::placeholder{color:#aab0ba}
  #wo-onb textarea{min-height:92px;resize:vertical}
  #wo-onb input:focus,#wo-onb textarea:focus{outline:none;border-color:#07378C;box-shadow:0 0 0 3px #dbe4f7}

  /* tables */
  #wo-onb .ss{border:1px solid #d3d8e0;border-radius:9px;overflow-x:auto}
  #wo-onb .sstab{width:100%;border-collapse:collapse;font-size:14px}
  #wo-onb .sstab th{background:#f2f6ff;color:#07378C;font-size:11.5px;font-weight:700;text-align:left;padding:9px 13px;border-bottom:1px solid #d6e3ff;letter-spacing:.3px;white-space:nowrap}
  #wo-onb .sstab th.rmc{width:40px}
  #wo-onb .sstab td{padding:0;border-bottom:1px solid #eef0f4}
  #wo-onb .sstab tr:last-child td{border-bottom:0}
  #wo-onb .sstab td:not(:last-child){border-right:1px solid #eef0f4}
  #wo-onb .sstab td input{width:100%;box-sizing:border-box;border:0;border-radius:0;padding:10px 13px;font-size:14px;font-family:inherit;background:transparent;color:#1f2430}
  #wo-onb .sstab td input:focus{outline:none;box-shadow:inset 0 0 0 2px #dbe4f7;background:#fbfcfe}
  #wo-onb .sstab .rm{background:transparent;color:#b3bac4;font-size:17px;line-height:1;padding:8px 10px;font-weight:400;width:100%}
  #wo-onb .sstab .rm:hover{color:#c0392b}

  /* upload */
  #wo-onb .upl{border:1.5px dashed #c9d0da;border-radius:11px;padding:20px 16px;text-align:center;background:#fafbfd}
  #wo-onb .upl input[type=file]{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);border:0}
  #wo-onb .upl:focus-within .btn{outline:2px solid #07378C;outline-offset:2px}
  #wo-onb .upl .btn{display:inline-block;background:#eef2fb;color:#07378C;font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;cursor:pointer}
  #wo-onb .upl .btn:hover{background:#e2e9f8}
  #wo-onb .upl .hint{color:#8a93a3;font-size:12px;margin-top:9px}
  #wo-onb .files{list-style:none;padding:0;margin:12px 0 0}
  #wo-onb .files li{font-size:13px;padding:8px 11px;background:#f2f6ff;border:1px solid #d6e3ff;border-radius:7px;margin:6px 0;display:flex;justify-content:space-between;gap:8px;color:#07378C}
  #wo-onb .files li .st{color:#6b7280;font-weight:600;white-space:nowrap}
  #wo-onb .files li .st.ok{color:#2F8F5C}
  #wo-onb .files li .st.err{color:#b3411f}

  /* buttons + states */
  #wo-onb button{font-family:inherit;font-weight:700;font-size:14px;border:0;border-radius:9px;padding:10px 18px;cursor:pointer}
  /* asymmetric top/bottom padding optically centres the label: it has no descenders,
     so a geometrically-centred box reads top-heavy. 18/14 nudges the ink down ~2px. */
  #wo-onb .submit{background:#E26337;color:#fff;font-size:16px;padding:18px 22px 14px;width:100%;margin-top:10px}
  #wo-onb .submit:hover{filter:brightness(1.05)}
  /* greyed until the essentials are in — kept clickable (not disabled) so the hover
     title still fires and a click can scroll them to the first missing section. */
  #wo-onb .submit.needs{background:#cfd6e0;cursor:not-allowed}
  #wo-onb .submit.needs:hover{filter:none}
  /* ---- splash: shown only when the URL carries no ?c=, so an emailed link never sees it ----
     Everything animates on entrance with pure CSS delays; there is no JS timeline to
     fall out of sync, and prefers-reduced-motion turns the movement off wholesale. */
  #wo-onb #wo-splash{position:relative;overflow:hidden;padding:clamp(48px,9vh,96px) 20px;
    margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);width:auto;
    min-height:clamp(460px,66vh,780px);display:flex;align-items:center;justify-content:center;text-align:center;isolation:isolate}
  #wo-onb .sp-inner{max-width:640px;margin:0 auto;width:100%}
  #wo-onb .sp-glow{position:absolute;inset:-25%;z-index:-1;pointer-events:none;
    background:radial-gradient(34% 44% at 32% 34%,rgba(226,99,55,.20),transparent 70%),
               radial-gradient(38% 48% at 70% 64%,rgba(7,55,140,.17),transparent 72%);
    -webkit-mask-image:radial-gradient(ellipse 62% 68% at 50% 50%,#000 38%,transparent 78%);
    mask-image:radial-gradient(ellipse 62% 68% at 50% 50%,#000 38%,transparent 78%);
    animation:sp-drift 22s ease-in-out infinite alternate}
  @keyframes sp-drift{from{transform:translate3d(-2%,-1%,0) scale(1)}to{transform:translate3d(3%,2%,0) scale(1.12)}}
  #wo-onb .sp-inner>*{opacity:0;animation:sp-rise .7s cubic-bezier(.16,.84,.44,1) forwards}
  @keyframes sp-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  #wo-onb .sp-logo{width:min(238px,62%);height:auto;display:block;margin:0 auto 30px;
    animation-name:sp-logo!important;animation-duration:.9s;animation-delay:.05s}
  @keyframes sp-logo{from{opacity:0;transform:translateY(10px) scale(.965)}to{opacity:1;transform:none}}
  #wo-onb .sp-title{font-size:34px;line-height:1.15;color:#07378C;margin:0 0 14px;letter-spacing:-.02em;animation-delay:.18s}
  #wo-onb .sp-sub{font-size:16px;line-height:1.62;color:#5a6472;margin:0 auto 14px;max-width:52ch;animation-delay:.28s}
  #wo-onb .sp-sub2{margin-bottom:34px;animation-delay:.34s}
  #wo-onb .sp-actions{display:flex;flex-direction:column;align-items:center;gap:16px;animation-delay:.38s}
  #wo-onb .sp-cta{position:relative;overflow:hidden;background:#E26337;color:#fff;border:0;border-radius:999px;
    padding:15px 38px;font:600 16px/1 inherit;cursor:pointer;box-shadow:0 8px 22px rgba(226,99,55,.28);
    transition:transform .25s cubic-bezier(.16,.84,.44,1),box-shadow .25s}
  #wo-onb .sp-cta:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(226,99,55,.36)}
  #wo-onb .sp-cta:active{transform:translateY(0)}
  #wo-onb .sp-cta span{position:relative;z-index:1}
  /* a slow sheen that reads as motion without asking for attention */
  #wo-onb .sp-cta::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;
    background:linear-gradient(100deg,transparent,rgba(255,255,255,.28),transparent);
    animation:sp-sheen 4.5s ease-in-out 1.6s infinite}
  @keyframes sp-sheen{0%{left:-60%}45%{left:130%}100%{left:130%}}
  #wo-onb .sp-quiet{background:none;border:0;padding:2px;color:#07378C;font:inherit;font-size:14.5px;cursor:pointer;
    text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;
    text-decoration-color:rgba(7,55,140,.3);transition:color .2s,text-decoration-color .2s}
  #wo-onb .sp-quiet:hover{color:#E26337;text-decoration-color:rgba(226,99,55,.6)}
  /* opacity:1 is load-bearing: .sp-inner>* sets opacity:0 for the entrance, and this
     animation has no fill mode, so without it the revealed field lands back invisible. */
  #wo-onb .sp-paste{max-width:440px;margin:22px auto 0;opacity:1;animation:sp-open .45s cubic-bezier(.16,.84,.44,1)}
  @keyframes sp-open{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
  #wo-onb .sp-paste[hidden]{display:none}
  #wo-onb .sp-row{display:flex;gap:9px}
  #wo-onb .sp-row input{flex:1 1 auto;min-width:0;border-radius:999px;padding:12px 18px}
  #wo-onb .sp-go{background:#07378C;color:#fff;border:0;border-radius:999px;padding:12px 22px;font:600 15px/1 inherit;cursor:pointer;transition:background .2s}
  #wo-onb .sp-go:hover{background:#052a6b}
  #wo-onb .sp-err{margin-top:10px;font-size:13.5px;color:#b3411f;text-align:left}
  #wo-onb .sp-hint{font-size:13.5px;color:#5a6472;margin:0 0 10px}
  #wo-onb .sp-need{max-width:440px;margin:30px auto 0;text-align:left;background:#f7f9fd;border:1px solid #e6ecf6;border-radius:14px;padding:16px 20px;animation-delay:.46s}
  #wo-onb .sp-needlead{font-size:13.5px;line-height:1.55;color:#07378C;font-weight:600;margin:0 0 10px}
  #wo-onb .sp-needttl{font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#8a93a3;margin:0 0 8px}
  #wo-onb .sp-needlist{margin:0;padding:0 0 0 18px;color:#5a6472;font-size:13.5px;line-height:1.7}
  #wo-onb .sp-foot{margin:38px 0 0;animation-delay:.54s}
  #wo-onb .sp-foot .sp-quiet{font-size:13.5px;color:#7a8494;text-decoration-color:rgba(122,132,148,.35)}
  @media (max-width:600px){
    #wo-onb #wo-splash{padding:44px 16px 40px}
    #wo-onb .sp-title{font-size:27px}
    #wo-onb .sp-sub{font-size:15px}
    #wo-onb .sp-sub2{margin-bottom:26px}
    #wo-onb .sp-logo{margin-bottom:24px}
    #wo-onb .sp-cta{width:100%}
    #wo-onb .sp-row{flex-direction:column}
    #wo-onb .sp-go{width:100%}
  }
  @media (prefers-reduced-motion:reduce){
    #wo-onb .sp-inner>*,#wo-onb .sp-logo,#wo-onb .sp-glow,#wo-onb .sp-paste{animation:none!important;opacity:1!important;transform:none!important;stroke-dashoffset:0!important}
    #wo-onb .sp-cta::after{animation:none;display:none}
    #wo-onb .sp-cta:hover{transform:none}
  }
  #wo-onb #wo-loading{position:relative;overflow:hidden;padding:clamp(48px,9vh,96px) 20px;
    margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);
    min-height:clamp(380px,52vh,620px);display:flex;align-items:center;justify-content:center;text-align:center;isolation:isolate}
  #wo-onb .ld-bar{width:min(260px,70%);height:4px;margin:6px auto 0;border-radius:4px;background:rgba(7,55,140,.12);overflow:hidden}
  #wo-onb .ld-bar>span{display:block;width:40%;height:100%;border-radius:4px;background:#E26337;animation:ld-slide 1.25s ease-in-out infinite}
  @keyframes ld-slide{0%{transform:translateX(-110%)}100%{transform:translateX(310%)}}
  @media (prefers-reduced-motion:reduce){ #wo-onb .ld-bar>span{animation:none;width:100%} }
  #wo-onb .locked{background:#FFF4EF;border:1px solid #f3c9bb;border-radius:11px;padding:14px 16px;color:#7a2e12;margin-bottom:18px;font-size:14px}
  #wo-onb .done{text-align:center;padding:48px 16px}
  #wo-onb .done h1{font-size:28px}

  /* collapsible sections */
  #wo-onb .sec h2{cursor:pointer;user-select:none}
  #wo-onb .sec .done-toggle{margin-left:auto;flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;cursor:pointer}
  #wo-onb .sec .check{flex:0 0 auto;width:22px;height:22px;border:2px solid #cdd4df;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:transparent;font-size:14px;font-weight:800;line-height:1;transition:background .15s,border-color .15s,color .15s}
  #wo-onb .sec .done-label{font-size:12px;font-weight:600;color:#9aa4b4;letter-spacing:.2px;white-space:nowrap}
  #wo-onb .sec .done-toggle:hover .check{border-color:#2F8F5C}
  #wo-onb .sec .done-toggle:hover .done-label{color:#2F8F5C}
  #wo-onb .sec.filled .check{background:#2F8F5C;border-color:#2F8F5C;color:#fff}
  #wo-onb .sec.filled .done-label{color:#2F8F5C}
  #wo-onb .sec .due{flex:0 0 auto;font-size:11px;font-weight:700;letter-spacing:.3px;color:#07378C;background:#eef2fb;border:1px solid #d6e3ff;border-radius:20px;padding:3px 9px;white-space:nowrap}
  /* traffic light: overdue or inside a week red, inside a fortnight amber, else blue */
  #wo-onb .sec .due.past,#wo-onb .sec .due.soon{color:#b3411f;background:#FDEFE9;border-color:#f3c9bb}
  #wo-onb .sec .due.warn{color:#8a5a00;background:#FFF6E3;border-color:#f2dca6}
  #wo-onb .sec .due.none{color:#9aa3b0;background:transparent;border:1px dashed #dbe1e9;font-weight:500}
  /* project checklist: read-only, filled from the Monday record */
  #wo-onb .tasks{border:1px solid #d6e3ff;border-radius:12px;padding:20px 22px;margin:0 0 22px;background:#f7f9ff}
  #wo-onb .tasks .t-head{display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;margin:0 0 4px}
  #wo-onb .tasks .t-title{color:#07378C;font-size:17px;font-weight:700;margin:0 auto 0 0}
  #wo-onb .tasks .t-note{color:#5b6472;font-size:13px;margin:0 0 6px}
  #wo-onb .tasks .t-sum{font-size:11px;font-weight:700;letter-spacing:.3px;border-radius:20px;padding:3px 9px;white-space:nowrap}
  #wo-onb .tasks .t-group{color:#07378C;font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;margin:16px 0 4px}
  #wo-onb .tasks .t-row{display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-top:1px solid #e3eaf8;font-size:14px}
  #wo-onb .tasks .t-group + .t-row{border-top:0}
  #wo-onb .tasks .t-box{flex:0 0 auto;width:18px;height:18px;margin-top:1px;border:2px solid #cdd4df;border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;color:transparent;font-size:11px;font-weight:800;line-height:1}
  #wo-onb .tasks .t-row.t-done .t-box{background:#2F8F5C;border-color:#2F8F5C;color:#fff}
  #wo-onb .tasks .t-name{flex:1 1 auto;min-width:0}
  #wo-onb .tasks .t-row.t-done .t-name{color:#7b8494}
  #wo-onb .tasks .t-own{flex:0 0 auto;display:inline-flex;gap:5px}
  #wo-onb .tasks .t-pill{font-size:11px;font-weight:700;letter-spacing:.2px;border-radius:20px;padding:2px 8px;white-space:nowrap}
  #wo-onb .tasks .wo{color:#b3411f;background:#FDEFE9;border:1px solid #f3c9bb}
  #wo-onb .tasks .cl{color:#07378C;background:#eef2fb;border:1px solid #d6e3ff}
  @media (max-width:520px){
    #wo-onb .tasks{padding:16px 14px}
    #wo-onb .tasks .t-row{display:grid;grid-template-columns:18px 1fr;gap:5px 10px}
    #wo-onb .tasks .t-own{grid-column:2}
  }
  #wo-onb .sec .chev{width:9px;height:9px;border-right:2px solid #9aa4b4;border-bottom:2px solid #9aa4b4;transform:rotate(-45deg);transition:transform .2s ease;flex:0 0 auto;margin-top:-3px}
  #wo-onb .sec.open .chev{transform:rotate(45deg)}
  #wo-onb .sec:not(.open) .intro,#wo-onb .sec:not(.open) .secbody{display:none}
  #wo-onb .sec:not(.open) h2{margin-bottom:0}

  /* communication samples */
  #wo-onb .wo-cs-grp{border:1px solid #dbe4f7;border-radius:11px;overflow:hidden;margin:0 0 12px;background:#fff}
  #wo-onb .wo-cs-grp:last-child{margin-bottom:0}
  #wo-onb .wo-cs-grph{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:14px 16px;background:#f2f6ff;border:0;border-radius:0;text-align:left;cursor:pointer;font-family:inherit;font-weight:400}
  #wo-onb .wo-cs-grph:hover{background:#e8effc}
  #wo-onb .wo-cs-grp.open .wo-cs-grph{border-bottom:1px solid #dbe4f7}
  #wo-onb .wo-cs-gnum{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;border-radius:50%;background:#07378C;color:#fff;font-size:12.5px;font-weight:700}
  #wo-onb .wo-cs-gtw{min-width:0;flex:1 1 auto}
  #wo-onb .wo-cs-gt{display:block;font-size:15px;font-weight:700;color:#07378C;line-height:1.3}
  #wo-onb .wo-cs-gw{display:block;font-size:12px;color:#5b6472;margin-top:2px}
  #wo-onb .wo-cs-gc{flex:0 0 auto;font-size:11.5px;font-weight:700;color:#07378C;background:#fff;border:1px solid #d6e3ff;padding:4px 10px;border-radius:20px;white-space:nowrap}
  #wo-onb .wo-cs-gchev{flex:0 0 auto;width:9px;height:9px;border-right:2px solid #07378C;border-bottom:2px solid #07378C;transform:rotate(45deg);transition:transform .2s ease;margin:-4px 2px 0 0}
  #wo-onb .wo-cs-grp.open .wo-cs-gchev{transform:rotate(-135deg);margin-top:2px}
  #wo-onb .wo-cs-grid{display:none;flex-wrap:wrap;gap:10px;padding:14px 16px}
  #wo-onb .wo-cs-grp.open .wo-cs-grid{display:flex}
  #wo-onb .wo-cs-card{position:relative;flex:1 1 195px;min-width:170px;max-width:100%;box-sizing:border-box;border:1px solid #e6e9ef;border-radius:11px;background:#fff;padding:13px 14px;text-align:left;cursor:pointer;font-family:inherit;font-weight:400;font-size:14px;transition:border-color .15s,box-shadow .15s,transform .15s}
  #wo-onb .wo-cs-card:hover,#wo-onb .wo-cs-card:focus-visible{border-color:#07378C;box-shadow:0 8px 22px rgba(7,55,140,.13);transform:translateY(-1px);outline:none}
  #wo-onb .wo-cs-card>span{display:block}
  #wo-onb .wo-cs-card>span.wo-cs-tags{display:flex;flex-wrap:wrap;gap:5px}
  #wo-onb .wo-cs-tag{font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;padding:3px 7px;border-radius:5px;white-space:nowrap}
  #wo-onb .wo-cs-tag.email{background:#eef2fb;color:#07378C}
  #wo-onb .wo-cs-tag.sms{background:#e8f6ee;color:#2F8F5C}
  #wo-onb .wo-cs-tag.you{background:#FDEFE9;color:#b3411f}
  #wo-onb .wo-cs-t{font-size:14px;font-weight:700;color:#07378C;margin:8px 0 3px;line-height:1.3}
  #wo-onb .wo-cs-b{font-size:12.5px;color:#5b6472;line-height:1.45}
  #wo-onb .wo-cs-w{font-size:11.5px;color:#9aa4b4;margin-top:8px}
  #wo-onb .wo-cs-open{font-size:11.5px;font-weight:700;color:#E26337;margin-top:8px}
  /* hover preview */
  /* modal */
  #wo-onb .wo-cs-ov{position:fixed;inset:0;background:rgba(16,24,40,.62);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto}
  #wo-onb .wo-cs-ov[hidden]{display:none}
  #wo-onb .wo-cs-md{background:#fff;border-radius:14px;width:100%;max-width:640px;margin:auto;box-shadow:0 24px 60px rgba(16,24,40,.3);overflow:hidden}
  #wo-onb .wo-cs-mh{display:flex;align-items:flex-start;gap:12px;padding:18px 20px;border-bottom:1px solid #eef0f4}
  #wo-onb .wo-cs-mh h3{margin:0;font-size:17px;font-weight:700;color:#07378C;line-height:1.3}
  #wo-onb .wo-cs-mh .wo-cs-w{margin-top:4px}
  #wo-onb .wo-cs-x{margin-left:auto;flex:0 0 auto;background:#f2f4f8;color:#5b6472;font-size:17px;line-height:1;padding:7px 11px;border-radius:8px}
  #wo-onb .wo-cs-x:hover{background:#e6e9ef;color:#1f2430}
  #wo-onb .wo-cs-mb{padding:18px 20px;background:#f7f9fc;max-height:none}
  #wo-onb .wo-cs-mf{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 20px;border-top:1px solid #eef0f4}
  #wo-onb .wo-cs-note{font-size:12px;color:#8a93a3;flex:1 1 200px;line-height:1.45}
  #wo-onb .wo-cs-copy{background:#E26337;color:#fff}
  #wo-onb .wo-cs-copy:hover{filter:brightness(1.05)}
  /* email sheet */
  #wo-onb .wo-cs-sheet{background:#fff;border:1px solid #e6e9ef;border-radius:11px;overflow:hidden}
  #wo-onb .wo-cs-mail{padding:13px 17px;border-bottom:1px solid #eef0f4;background:#fbfcfe}
  #wo-onb .wo-cs-mailr{font-size:12.5px;color:#5b6472;margin:2px 0;overflow-wrap:anywhere}
  #wo-onb .wo-cs-mailr b{color:#1f2430;font-weight:700}
  #wo-onb .wo-cs-body{padding:18px 20px;font-size:14px;line-height:1.6;color:#1f2430;overflow-wrap:anywhere}
  #wo-onb .wo-cs-body p{margin:0 0 13px}
  #wo-onb .wo-cs-body p:last-child{margin-bottom:0}
  #wo-onb .wo-cs-body h2{font-size:16px;color:#07378C;margin:0 0 10px}
  #wo-onb .wo-cs-body ul{margin:0 0 13px;padding-left:20px}
  #wo-onb .wo-cs-body li{margin:0 0 6px}
  #wo-onb .wo-cs-body a{color:#07378C}
  #wo-onb .wo-ml-card{border:1px solid #e3e9f3;border-left:3px solid #07378C;border-radius:8px;background:#f7f9fc;padding:13px 15px;margin:0 0 13px}
  #wo-onb .wo-ml-btn{display:inline-block;background:#E26337;color:#fff;font-weight:700;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none;margin:2px 0 13px}
  /* crew: real headshots where we have them, role icons for the rest */
  #wo-onb .wo-ml-people{margin:0 0 13px}
  #wo-onb .wo-ml-person{display:flex;gap:13px;align-items:flex-start;margin:0 0 15px}
  #wo-onb .wo-ml-person:last-child{margin-bottom:0}
  #wo-onb .wo-ml-av{flex:0 0 auto;width:52px;height:52px;border-radius:26px;display:block;background:#f2f6ff}
  #wo-onb .wo-ml-pn{font-size:14px;font-weight:700;color:#111827}
  #wo-onb .wo-ml-pr{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#E26337;margin-left:7px}
  #wo-onb .wo-ml-pb{font-size:12.5px;color:#6b7280;line-height:1.5;margin-top:3px}
  #wo-onb .wo-ml-strip{display:flex;flex-wrap:wrap;gap:16px 10px;justify-content:center;margin:0 0 13px}
  #wo-onb .wo-ml-sp{width:98px;text-align:center}
  #wo-onb .wo-ml-sp img{width:60px;height:60px;border-radius:30px;display:block;margin:0 auto 7px;background:#f2f6ff}
  #wo-onb .wo-ml-sn{font-size:12.5px;font-weight:700;color:#111827;line-height:1.3}
  #wo-onb .wo-ml-sr{font-size:9.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:#E26337;line-height:1.3;margin-top:2px}
  /* sms phone */
  #wo-onb .wo-cs-phone{max-width:330px;margin:0 auto;background:#fff;border:1px solid #e6e9ef;border-radius:22px;padding:16px 14px 20px}
  #wo-onb .wo-cs-phoneh{text-align:center;font-size:11.5px;color:#9aa4b4;border-bottom:1px solid #eef0f4;padding-bottom:10px;margin-bottom:14px}
  #wo-onb .wo-cs-bub{background:#e9edf4;color:#1f2430;border-radius:16px 16px 16px 4px;padding:11px 14px;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
  /* mad lib tokens */
  #wo-onb .wo-ml{background:#fdf0e9;border-bottom:1.5px solid #E26337;border-radius:3px;padding:0 3px;font-weight:600;color:#b3411f;cursor:text}
  #wo-onb .wo-ml.filled{background:#eaf3ea;border-bottom-color:#2F8F5C;color:#1f6b41}
  #wo-onb .wo-ml:focus{outline:2px solid #07378C;outline-offset:1px;background:#fff}
  @media (max-width:520px){
    /* stack the stage bar so the title keeps full width and the count drops below it */
    #wo-onb .wo-cs-grph{display:grid;grid-template-columns:25px minmax(0,1fr) auto;grid-template-areas:"num text chev" "pad count count";gap:5px 11px;align-items:center;padding:13px 14px}
    #wo-onb .wo-cs-gnum{grid-area:num}
    #wo-onb .wo-cs-gtw{grid-area:text}
    #wo-onb .wo-cs-gchev{grid-area:chev;margin:0;align-self:center}
    #wo-onb .wo-cs-gc{grid-area:count;justify-self:start;background:none;border:0;padding:0;margin:0;font-size:12px}
    #wo-onb .wo-cs-grid{padding:12px}
    #wo-onb .sec .due{font-size:10px;padding:2px 7px;letter-spacing:.2px}
    #wo-onb .sec.has-due .done-label{display:none}
    /* the placeholder is an alignment aid; on a phone it would just wrap the title */
    #wo-onb .sec .due.none{display:none}
    #wo-onb .wo-cs-card{flex:1 1 100%}
    #wo-onb .wo-cs-ov{padding:12px 8px}
  }

  /* paste from spreadsheet */
  #wo-onb .pastebox{margin:12px 0 0}
  #wo-onb .pastetoggle{background:#eef2fb;color:#07378C;font-weight:600;font-size:13px;padding:8px 14px}
  #wo-onb .pastetoggle:hover{background:#e2e9f8}
  #wo-onb .pastewrap{margin-top:12px}
  #wo-onb .pastewrap textarea{width:100%;box-sizing:border-box;border:1px solid #d3d8e0;border-radius:9px;padding:11px 13px;font-size:13px;font-family:inherit;min-height:88px;resize:vertical}
  #wo-onb .pasteadd{background:#07378C;color:#fff;font-size:13px;margin-top:10px}
  `;

  function tableHTML(id, cfg) {
    var ths = cfg.cols.map(function (c) { return '<th>' + c.c + '</th>'; }).join('') + '<th class="rmc"></th>';
    return '<div class="ss"><table class="sstab"><thead><tr>' + ths + '</tr></thead>'
      + '<tbody id="wo-' + id + '"></tbody></table></div>'
      + '<input type="hidden" data-key="' + cfg.key + '" id="wo-' + id + '-val">';
  }
  function uploadHTML(id, hint) {
    return '<div class="upl"><label class="btn" id="wo-' + id + '-btn" for="wo-' + id + '-file">Choose file(s) to upload</label>'
      + '<input type="file" id="wo-' + id + '-file" multiple>'
      + '<div class="hint">' + hint + '</div></div>'
      + '<ul class="files" id="wo-' + id + '-files"></ul>';
  }

  var HTML = `
  <div id="wo-onb">
    <div id="wo-splash" style="display:none">
      <div class="sp-glow" aria-hidden="true"></div>
      <div class="sp-inner">
        <img class="sp-logo" src="https://webouts.com/wp-content/uploads/2022/03/WebOuts-crop-Logo.png" alt="WebOuts, Medical Media Specialists" width="719" height="230">
        <h1 class="sp-title">Let’s get your profile videos started</h1>
        <p class="sp-sub">This form gathers everything we need to produce your physician profile videos: your key contacts, the providers you’d like to film, how the videos should look and sound, your brand assets, and your filming logistics.</p>
        <p class="sp-sub sp-sub2">Work through it in any order and answer what you can. Everything saves as you type, and you’ll get a private link you can pass around your team and come back to any time.</p>
        <div class="sp-actions">
          <button type="button" class="sp-cta" id="wo-splash-new"><span>Start a new onboarding</span></button>
          <button type="button" class="sp-quiet" id="wo-splash-have" aria-expanded="false" aria-controls="wo-splash-paste">Resume</button>
        </div>
        <div class="sp-paste" id="wo-splash-paste" hidden>
          <p class="sp-hint">Paste the private link WebOuts sent you, or the one you saved.</p>
          <div class="sp-row">
            <input type="text" id="wo-splash-link" placeholder="Paste your private link or code" aria-label="Your private onboarding link">
            <button type="button" class="sp-go" id="wo-splash-open">Open</button>
          </div>
          <div class="sp-err" id="wo-splash-err" style="display:none"></div>
        </div>
        <div class="sp-need">
          <p class="sp-needlead">No need to gather everything first. Start now and fill the rest in over time, from any device, using your saved link.</p>
          <p class="sp-needttl">When you’re ready, it helps to have these on hand:</p>
          <ul class="sp-needlist">
            <li>Your provider list, with names, specialties and emails</li>
            <li>A link to your brand assets: logo, colors and fonts</li>
            <li>Your preferred filming dates</li>
            <li>A billing contact</li>
          </ul>
        </div>
        <p class="sp-foot"><button type="button" class="sp-quiet" id="wo-splash-peek">Preview the form without saving anything</button></p>
      </div>
    </div>
    <div id="wo-loading" style="display:none">
      <div class="sp-glow" aria-hidden="true"></div>
      <div class="sp-inner">
        <img class="sp-logo" src="https://webouts.com/wp-content/uploads/2022/03/WebOuts-crop-Logo.png" alt="WebOuts" width="719" height="230">
        <h1 class="sp-title">Grabbing your information</h1>
        <p class="sp-sub" role="status" aria-live="polite">One moment while we pull up everything you have saved.</p>
        <div class="ld-bar" aria-hidden="true"><span></span></div>
      </div>
    </div>
    <div id="wo-previewmsg" class="locked" style="display:none"><strong>Preview mode.</strong> Nothing you type here is saved and no record is created. To fill this in for real, reload the page and start a new onboarding.</div>
    <div class="bar">
      <span class="save"><span class="dot" id="wo-dot"></span><span id="wo-stat" role="status" aria-live="polite">Loading…</span></span>
      <div class="linkwrap">
        <span class="linklabel">Your private link — save it, or share it with your team</span>
        <span class="linkbox" id="wo-link"></span>
      </div>
      <button type="button" class="copy" id="wo-copy">Copy link</button>
      <div class="prog" id="wo-prog" title="How many sections your team has marked Completed.">
        <span class="progtrack"><span class="progfill" id="wo-progfill"></span></span>
        <span class="progtxt" id="wo-progtxt">0 of 10 sections done</span>
      </div>
    </div>
    <div id="wo-lockmsg" class="locked" style="display:none">This form has been locked by the WebOuts team and is now read-only. Contact us if something needs to change.</div>

    <h1 id="wo-welcome">Welcome! Let’s set up your profile videos</h1>
    <p class="sub" id="wo-welcomesub">This is how we get ready to film your providers. Most sections take a couple of minutes, and a few, like your provider list, you may want to gather first. You don’t need every answer today. This works best as a team effort: copy your private link above and pass it around so the right person fills in each section. Everything saves as you go, so anyone can stop and pick up later.</p>

    <div id="wo-tasks" class="tasks" style="display:none"></div>

    <div id="wo-form">
      <div class="sec" data-sec="org">
        <h2><span class="num">1</span> Your organization</h2>
        <div class="secbody">
          <div class="fld"><label>Organization name</label><input type="text" data-key="identity.displayName"></div>
          <div class="fld"><label>Website</label><input type="text" data-key="web.site" placeholder="https://…"></div>
          <div class="fld"><label>Provider email domain(s)</label><div class="help">So we recognize your team. Separate multiple with commas.</div><input type="text" data-key="identity.emailDomains" placeholder="@healthorganization.com"></div>
        </div>
      </div>

      <div class="sec" data-sec="people">
        <h2><span class="num">2</span> Key people &amp; approvals</h2>
        <p class="intro">Who we’ll be working with, and who signs off.</p>
        <div class="secbody">
          <div class="fld"><label>Main contact(s)</label><div class="help">Your day-to-day point(s) of contact. Add as many as you need.</div>${tableHTML('contacts', TABLES.contacts)}</div>
          <div class="fld"><label>Your wider team</label><div class="help">Anyone else involved, so we route things to the right person.</div>${tableHTML('team', TABLES.team)}</div>
          <div class="fld"><label>Who sends the kickoff email to providers?</label><div class="help">This should come from a senior leader, ideally someone in the C-suite or the president, someone with real sway over your providers. When the ask comes from the top, providers treat it as a priority instead of a nice-to-have from marketing or communications, and participation goes way up. Give us their name and title, or tell us you’d like WebOuts to send it.</div><input type="text" data-key="rollout.leadershipSender" placeholder="e.g. Dr. Jordan Lee, Chief Medical Officer"></div>
          <div class="fld"><label>Approvals</label><div class="help">Who signs off at each step? Add each person, and add any other checks your videos go through before they’re final.</div>${tableHTML('approvals', TABLES.approvals)}</div>
          <div class="fld"><label>Anything else we should know about your team?</label><div class="help">Optional and open-ended. Anything about how your team is set up or likes to work that helps us serve you better.</div><textarea data-key="process.details"></textarea></div>
        </div>
      </div>

      <div class="sec" data-sec="providers">
        <h2><span class="num">3</span> Providers to feature</h2>
        <div class="secbody">
          <div class="help">List the providers you’d like to feature, and include about <strong>50% more than your first-round target</strong> so we can cover scheduling conflicts (targeting 16? list 24. A full week of 40? list 60). Type directly, or paste your whole list from a spreadsheet.</div>
          ${tableHTML('providers', TABLES.providers)}
          <div class="pastebox">
            <button type="button" class="pastetoggle pasteui" id="wo-prov-paste-toggle">Paste from a spreadsheet</button>
            <div class="pastewrap" id="wo-prov-paste" style="display:none">
              <div class="help">Copy the name, specialty, email, and profile link columns from Excel or Google Sheets, then paste below. One provider per line — we’ll fill in the rows for you. Missing a column? Paste what you have.</div>
              <textarea class="pasteui" id="wo-prov-paste-txt" placeholder="Dr. Jane Smith, Cardiology, jane@org.com, https://…"></textarea>
              <button type="button" class="pasteadd pasteui" id="wo-prov-paste-add">Add to table</button>
            </div>
          </div>
        </div>
      </div>

      <div class="sec" data-sec="filming">
        <h2><span class="num">4</span> Filming logistics</h2>
        <div class="secbody">
          <div class="fld"><label>Filming address</label><div class="help">Where should our crew come to film?</div><input type="text" data-key="filming.location"></div>
          <div class="fld"><label>Preferred filming dates</label><div class="help"><strong>We film 8 profiles a day.</strong> So two days covers 16 providers, three days covers 24, and a full week covers 40. List the dates that work for you, best first, and we’ll hold them. Nothing is locked in until we confirm the dates back to you.</div>${tableHTML('filmdates', TABLES.filmdates)}</div>
          <div class="fld"><label>Total appointment slots</label><div class="help">How many providers you’d like to film in total across those dates. Leave it blank if you’d rather we work it out from the dates above.</div><input type="text" data-key="filming.slots" placeholder="16"></div>
          <div class="fld"><label>Anything our crew should know?</label><div class="help">On-site contact, parking or building access, the room we’ll film in, best days and times.</div><textarea data-key="production.details"></textarea></div>
        </div>
      </div>

      <div class="sec" data-sec="look">
        <h2><span class="num">5</span> Look, sound &amp; SEO</h2>
        <p class="intro">How you’d like the videos to feel. Share what you have, and we’ll fill any gaps.</p>
        <div class="secbody">
          <div class="fld"><label>Graphics</label><div class="help">The on-screen graphics for your videos, like lower-thirds and title cards. If you have editable <strong>Adobe or DaVinci Resolve</strong> project files, upload them below and we’ll use those files directly. If not, we’ll design a set from your brand guidelines.</div>${uploadHTML('gfx', 'Upload your Adobe or DaVinci Resolve project files. Something larger? Email it and we’ll add it.')}</div>
          <div class="fld"><label>Scripting</label><div class="help">Tone and voice, any must-say or never-say, reading level, and legal or compliance notes.</div><textarea data-key="scripting.standards"></textarea></div>
          <div class="fld"><label>Interview questions and preferred sound bites</label><div class="help">Questions you’d like us to ask in the script interview, and any sound bites you want to be sure we capture. Paste your own list if you have one. If you leave this blank we’ll use our standard interview guide.</div><textarea data-key="scripting.interviewQuestions"></textarea></div>
          <div class="fld"><label>Approved images for green-screen backgrounds</label><div class="help">A folder link to approved architectural images we can use behind your providers. Building exteriors, lobbies, and interiors all work well. Please check that sharing is set so anyone with the link can view.</div><input type="text" data-key="look.backgroundImages" placeholder="https://…"></div>
          <div class="fld"><label>SEO</label><div class="help">If you follow an SEO formula for titles, descriptions or file names, paste it here, or drop in a couple of real examples from past videos. We’ll build off your exact pattern.</div><textarea data-key="seo.standards" placeholder="e.g. [Provider Name], [Specialty] | [Organization] — [City, State]"></textarea></div>
        </div>
      </div>

      <div class="sec" data-sec="samples">
        <h2><span class="num">6</span> Communications and reminders</h2>
        <p class="intro">Every email and text we send, so nothing is a surprise. Open a stage to see what arrives and when.</p>
        <div class="secbody">
          <div class="help">These are real templates with the names taken out. As you fill in the rest of this form, the <span class="wo-ml filled">highlighted blanks</span> fill themselves in with your details. You can also click any blank and type your own wording to see how it reads.</div>
          <div id="wo-cs-list"></div>
        </div>
      </div>

      <div class="sec" data-sec="brand">
        <h2><span class="num">7</span> Brand guidelines</h2>
        <div class="secbody">
          <div class="help">Your style guide, logo files, colors and fonts.</div>
          <div class="fld"><label>Link to your brand assets</label><div class="help">Easiest for both of us, and there is no size limit. A brand portal, Google Drive or Dropbox folder, or a page on your own site all work. Please check that sharing is set so anyone with the link can view, otherwise it reaches us locked.</div><input type="text" data-key="brandGuide.link" placeholder="https://…"></div>
          <div class="help">Or upload smaller files directly (PDF or image, up to 10&nbsp;MB each). Handy for a logo or a short guide. Anything bigger should come as a link.</div>
          ${uploadHTML('brand', 'Files attach straight to your onboarding record.')}
        </div>
      </div>

      <div class="sec" data-sec="resources">
        <h2><span class="num">8</span> Samples &amp; resources</h2>
        <p class="intro">Anything else that helps us understand what you want. All optional.</p>
        <div class="secbody">
          <div class="help">Profile videos you like or want us to match, sound bites, b-roll, past scripts, photos, style references, anything at all. Name each one so we know what we are looking at, then paste a link. A new row appears as you go.</div>
          <div class="help"><strong>Please share links rather than files.</strong> Most of this is video, and links sidestep upload size limits entirely. Google Drive, Dropbox, YouTube, Vimeo, or a page on your own site all work. Just check that sharing is set so anyone with the link can view.</div>
          ${tableHTML('resources', TABLES.resources)}
        </div>
      </div>

      <div class="sec" data-sec="billing">
        <h2><span class="num">9</span> Billing</h2>
        <p class="intro">So invoices reach the right desk the first time.</p>
        <div class="secbody">
          <div class="fld"><label>Billing contact(s)</label><div class="help">Who should receive invoices. Add accounts payable as well as your own contact if that helps.</div>${tableHTML('billing', TABLES.billing)}</div>
          <div class="fld"><label>Purchase order or reference number</label><div class="help">If your organization requires one on the invoice, put it here.</div><input type="text" data-key="billing.po"></div>
          <div class="fld"><label>Is an updated invoice required?</label><div class="help">Tell us if anything on our current invoice needs to change, for example a different entity name, address, PO number, or cost center.</div><textarea data-key="billing.updatedInvoice"></textarea></div>
          <div class="fld"><label>How should we send invoices?</label><div class="help">Email, a billing portal, or anything else we should follow. Include payment terms if you have set ones.</div><textarea data-key="billing.instructions"></textarea></div>
        </div>
      </div>

      <div class="sec" data-sec="misc">
        <h2><span class="num">10</span> Anything else</h2>
        <div class="secbody">
          <div class="help">Anything else we should know that didn’t fit above.</div>
          <textarea data-key="misc.notes" aria-label="Anything else"></textarea>
        </div>
      </div>

      <button type="button" class="submit" id="wo-submit">I’m done, submit for review</button>
    </div>

    <div class="wo-cs-ov" id="wo-cs-ov" hidden>
      <div class="wo-cs-md" role="dialog" aria-modal="true" aria-labelledby="wo-cs-mt">
        <div class="wo-cs-mh">
          <div>
            <h3 id="wo-cs-mt"></h3>
            <div class="wo-cs-w" id="wo-cs-mw"></div>
          </div>
          <button type="button" class="wo-cs-x" id="wo-cs-x" aria-label="Close">✕</button>
        </div>
        <div class="wo-cs-mb" id="wo-cs-mb"></div>
        <div class="wo-cs-mf">
          <span class="wo-cs-note" id="wo-cs-note"></span>
          <button type="button" class="wo-cs-copy" id="wo-cs-copy" style="display:none">Copy email text</button>
        </div>
      </div>
    </div>

    <div class="done" id="wo-done" style="display:none">
      <h1>Thank you!</h1>
      <p class="sub">Your information is in with the WebOuts team. We’ll review it and follow up with next steps. You can still reopen your link to make changes until we lock it in.</p>
    </div>
  </div>
  `;

  // ---- inject ----
  var st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
  var mount = document.getElementById('wo-onboarding-root');
  if (!mount) { mount = document.createElement('div'); document.body.appendChild(mount); }
  mount.innerHTML = HTML;

  var root = document.getElementById('wo-onb');
  var dotEl = document.getElementById('wo-dot');
  var statEl = document.getElementById('wo-stat');
  var linkEl = document.getElementById('wo-link');

  // A visit with no ?c= gets the splash instead of a live form. Landing straight on a
  // working form meant every curious visitor and every staff member checking the page
  // started a real onboarding, and the board filled up with junk records.
  var params = new URLSearchParams(location.search);
  var token = params.get('c');
  var preview = false;
  var splash = document.getElementById('wo-splash');

  function saved(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function remember(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function newToken() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
  }
  function looksLikeToken(s) { return /^[A-Za-z0-9-]{8,64}$/.test(s); }
  // Accepts a full pasted URL or a bare token, so "paste your link" tolerates either.
  function tokenFrom(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    var m = s.match(/[?&]c=([^&#\s]+)/);
    if (m) s = decodeURIComponent(m[1]);
    return looksLikeToken(s) ? s : '';
  }
  // An empty form rendered while the answers are still in flight looks exactly like
  // lost data, which is the one thing this form must never look like. Hide it from the
  // first frame, and show the "grabbing your information" panel only if the wait is long
  // enough to notice, so a fast load does not flash a loading screen at anyone.
  var loadTimer = null;
  function startLoading() {
    var chrome = ['wo-form', 'wo-welcome', 'wo-welcomesub'];
    chrome.forEach(function (id) { document.getElementById(id).style.display = 'none'; });
    root.querySelector('.bar').style.display = 'none';
    document.getElementById('wo-tasks').style.display = 'none';
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () { document.getElementById('wo-loading').style.display = ''; }, 180);
  }
  function endLoading() {
    clearTimeout(loadTimer);
    document.getElementById('wo-loading').style.display = 'none';
    root.querySelector('.bar').style.display = '';
    document.getElementById('wo-form').style.display = '';
    document.getElementById('wo-welcome').style.display = '';
    document.getElementById('wo-welcomesub').style.display = '';
  }
  function showForm(t) {
    token = t;
    splash.style.display = 'none';
    startLoading();
    params.set('c', t);
    history.replaceState(null, '', location.pathname + '?' + params.toString());
    linkEl.textContent = location.href;
    loadForm(0);
  }

  if (!token) {
    splash.style.display = '';
    root.querySelector('.bar').style.display = 'none';
    document.getElementById('wo-form').style.display = 'none';
    document.getElementById('wo-welcome').style.display = 'none';
    document.getElementById('wo-welcomesub').style.display = 'none';
  } else {
    linkEl.textContent = location.href;
    startLoading();
  }

  var fields = Array.prototype.slice.call(root.querySelectorAll('[data-key]'));
  var locked = false;
  var loaded = false;
  var itemId = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // What the server held when this tab last synced. Saves send only what differs from
  // it, so two people editing different sections cannot revert each other: a tab that
  // never touched section 3 never sends section 3. An empty string means "cleared",
  // which is also the only way a deletion reaches storage.
  var baseline = {};
  function changed() {
    var out = {};
    fields.forEach(function (el) {
      var k = el.getAttribute('data-key');
      var now = el.value;
      var was = baseline[k] == null ? '' : String(baseline[k]);
      if (now !== was) out[k] = now;
    });
    return out;
  }
  function syncBaseline(sent) {
    Object.keys(sent || {}).forEach(function (k) { baseline[k] = sent[k]; });
  }
  function apply(data) {
    fields.forEach(function (el) {
      var k = el.getAttribute('data-key');
      if (k in data) el.value = data[k];
    });
  }
  function setSave(state, txt) { dotEl.className = 'dot ' + state; statEl.textContent = txt; }

  function postJSON(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        // A 500 with a JSON body used to parse fine and read as success, so the form
        // said "All changes saved" having written nothing. Treat it as the failure it is.
        if (!r.ok) { var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
        return r.json();
      });
  }

  var saveTimer = null, saving = false, pending = false, pendingExtra = null, halted = false;
  // The API refuses to save when it cannot read the stored answers, rather than
  // merging over them. Stop everything and say so instead of looping on the error.
  function halt(msg) {
    halted = true;
    setSave('error', msg || 'Something went wrong, please contact WebOuts');
    var box = document.getElementById('wo-lockmsg');
    if (box) { box.textContent = msg || 'Something went wrong, please contact WebOuts.'; box.style.display = 'block'; }
  }
  function doSave(extra) {
    if (preview || locked || halted || !loaded) return;
    // Queueing used to drop `extra`, so clicking submit while a save was in flight
    // threw away the "Submitted for Review" stage and nothing told WebOuts they were done.
    if (saving) {
      pending = true;
      if (extra) pendingExtra = Object.assign(pendingExtra || {}, extra);
      return;
    }
    var data = changed();
    if (extra) Object.keys(extra).forEach(function (k) { data[k] = extra[k]; });
    if (!Object.keys(data).length) { setSave('saved', 'All changes saved'); return; }
    saving = true; setSave('saving', 'Saving…');
    postJSON(API, { action: 'save', token: token, data: data })
      .then(function (res) {
        if (!res || res.ok !== true) { halt(res && res.error); return; }
        if (res.itemId) itemId = res.itemId;
        syncBaseline(data);
        setSave('saved', 'All changes saved');
      })
      .catch(function () { setSave('error', 'Couldn’t save, check your connection'); })
      .finally(function () {
        saving = false;
        if (pending) { pending = false; var e = pendingExtra; pendingExtra = null; doSave(e); }
      });
  }
  // 3s rather than 1.2s: a whole client office shares one public IP, so every extra
  // request counts against limits they all share. A steady typist now costs a few
  // saves a minute instead of dozens, and the delay is invisible next to autosave.
  function queueSave() { if (preview || locked || halted || !loaded) return; clearTimeout(saveTimer); setSave('saving', 'Editing…'); saveTimer = setTimeout(doSave, 3000); }

  // ---- generic auto-expanding table (rows -> " | "-joined lines in a hidden input) ----
  function tableCtl(cfg, bodyEl, valEl) {
    function rowEmpty(tr) { return Array.prototype.every.call(tr.querySelectorAll('input'), function (i) { return !i.value.trim(); }); }
    function serialize() {
      var lines = [];
      Array.prototype.forEach.call(bodyEl.querySelectorAll('tr'), function (tr) {
        if (rowEmpty(tr)) return;
        // Any pipe, not just " | ": a value ending in "|" slipped through and shifted
        // every later column one place on the way back in.
        var vals = Array.prototype.map.call(tr.querySelectorAll('input'), function (i) { return i.value.trim().replace(/\|/g, '/'); });
        lines.push(vals.join(' | '));
      });
      valEl.value = lines.join('\n');
    }
    function ensureBlank() {
      var rows = bodyEl.querySelectorAll('tr');
      var last = rows[rows.length - 1];
      if (!last || !rowEmpty(last)) bodyEl.appendChild(row([]));
    }
    function onInput() { ensureBlank(); serialize(); queueSave(); }
    function row(vals) {
      var tr = document.createElement('tr');
      var html = cfg.cols.map(function (c) { return '<td><input type="text" placeholder="' + esc(c.ph || '') + '"></td>'; }).join('');
      html += '<td><button type="button" class="rm" aria-label="Remove row">×</button></td>';
      tr.innerHTML = html;
      var inputs = tr.querySelectorAll('input');
      cfg.cols.forEach(function (c, idx) { if (vals[idx]) inputs[idx].value = vals[idx]; });
      Array.prototype.forEach.call(inputs, function (inp) {
        inp.addEventListener('input', onInput);
        inp.addEventListener('blur', function () { clearTimeout(saveTimer); serialize(); doSave(); });
      });
      tr.querySelector('.rm').addEventListener('click', function () {
        if (locked) return;
        tr.parentNode.removeChild(tr);
        if (!bodyEl.querySelector('tr')) bodyEl.appendChild(row([]));
        ensureBlank(); serialize(); queueSave();
      });
      return tr;
    }
    function build(str) {
      bodyEl.innerHTML = '';
      var lines = String(str || '').split('\n').filter(function (l) { return l.trim(); });
      if (!lines.length && cfg.seed) { cfg.seed.forEach(function (s) { bodyEl.appendChild(row(s)); }); }
      else lines.forEach(function (line) { bodyEl.appendChild(row(line.split(' | '))); });
      ensureBlank();
    }
    function addRows(rowsVals) {
      var rows = bodyEl.querySelectorAll('tr');
      var last = rows[rows.length - 1];
      if (last && rowEmpty(last)) bodyEl.removeChild(last);
      rowsVals.forEach(function (v) { bodyEl.appendChild(row(v)); });
      ensureBlank(); serialize(); doSave();
    }
    return { build: build, addRows: addRows };
  }

  var tableCtls = {};
  Object.keys(TABLES).forEach(function (id) {
    var body = document.getElementById('wo-' + id);
    var val = document.getElementById('wo-' + id + '-val');
    tableCtls[id] = tableCtl(TABLES[id], body, val);
    tableCtls[id].build('');
  });

  // Make sure a row exists (and we know its id) before attaching a file.
  // Selecting several files fires this once per file, synchronously. Without sharing
  // one in-flight promise they each saw a null itemId and created their own record,
  // leaving duplicate board items with the uploads split between them.
  var itemPromise = null;
  function ensureItem() {
    if (itemId) return Promise.resolve(itemId);
    if (itemPromise) return itemPromise;
    itemPromise = postJSON(API, { action: 'save', token: token, data: changed() })
      .then(function (res) {
        if (res && res.itemId) itemId = res.itemId;
        return itemId;
      })
      .finally(function () { itemPromise = null; });
    return itemPromise;
  }
  function readB64(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { var s = String(fr.result || ''); var i = s.indexOf(','); resolve(i >= 0 ? s.slice(i + 1) : s); };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  // ---- generic upload widget (one per Monday Files column) ----
  function uploadCtl(kind, dataKey, id) {
    var inputEl = document.getElementById('wo-' + id + '-file');
    var listEl = document.getElementById('wo-' + id + '-files');
    var btnEl = document.getElementById('wo-' + id + '-btn');
    var items = [];
    function render() {
      listEl.innerHTML = items.map(function (e) {
        var lbl = e.st === 'ok' ? '<span class="st ok">uploaded</span>'
          : e.st === 'up' ? '<span class="st">uploading…</span>'
          : '<span class="st err">' + esc(e.msg || 'failed') + '</span>';
        return '<li><span>' + esc(e.name) + '</span>' + lbl + '</li>';
      }).join('');
    }
    function persist() {
      var names = items.filter(function (e) { return e.st === 'ok'; }).map(function (e) { return e.name; });
      var o = {}; o[dataKey] = names.join(', '); doSave(o);
    }
    function one(file) {
      if (locked) return;
      var entry = { name: file.name, st: 'up' };
      items.push(entry); render();
      if (file.size > MAX) { entry.st = 'err'; entry.msg = 'too large (max 10 MB)'; render(); return; }
      ensureItem().then(function (rid) {
        if (!rid) { entry.st = 'err'; entry.msg = 'type something first, then retry'; render(); return; }
        return readB64(file).then(function (b64) {
          return postJSON(UPLOAD, { token: token, itemId: rid, kind: kind, filename: file.name, mime: file.type || 'application/octet-stream', dataB64: b64 });
        }).then(function (res) {
          if (res && res.ok) { entry.st = 'ok'; render(); persist(); }
          else { entry.st = 'err'; entry.msg = (res && res.error) || 'upload failed'; render(); }
        });
      }).catch(function () { entry.st = 'err'; entry.msg = 'upload failed'; render(); });
    }
    inputEl.addEventListener('change', function () {
      Array.prototype.slice.call(this.files || []).forEach(one);
      this.value = '';
    });
    return {
      load: function (str) {
        items = String(str || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean)
          .map(function (n) { return { name: n, st: 'ok' }; });
        render();
      },
      disable: function () { inputEl.disabled = true; if (btnEl) btnEl.style.display = 'none'; }
    };
  }

  var gfxUp = uploadCtl('graphics', 'graphics.files', 'gfx');
  var brandUp = uploadCtl('brand', 'brandGuide.files', 'brand');

  // ---- collapsible sections + user-clickable "done" checks ----
  var SEC_SLUGS = ['org', 'people', 'providers', 'filming', 'look', 'brand', 'misc'];
  var secs = Array.prototype.slice.call(root.querySelectorAll('#wo-form > .sec'));
  var doneSecs = {};
  secs.forEach(function (sec, i) {
    // Slugs are declared in the markup so sections can be reordered without
    // remapping saved _done state; the positional list is the legacy fallback.
    if (!sec.getAttribute('data-sec')) sec.setAttribute('data-sec', SEC_SLUGS[i] || ('s' + i));
    var h = sec.querySelector('h2');
    h.setAttribute('role', 'button');
    h.setAttribute('tabindex', '0');
    h.setAttribute('aria-expanded', 'false');
    h.insertAdjacentHTML('beforeend', '<span class="done-toggle" role="checkbox" tabindex="0" aria-checked="false" aria-label="Mark this section completed" title="This Completed checkbox lets your team know this task is done. WebOuts will not check it for you."><span class="check" aria-hidden="true">✓</span><span class="done-label">Completed</span></span><span class="chev" aria-hidden="true"></span>');
    var toggle = h.querySelector('.done-toggle');
    function toggleDone() {
      if (locked) return;
      var slug = sec.getAttribute('data-sec');
      var on = sec.classList.toggle('filled');
      if (on) doneSecs[slug] = 1; else delete doneSecs[slug];
      toggle.setAttribute('aria-checked', on ? 'true' : 'false');
      doSave({ _done: Object.keys(doneSecs).join(',') });
      updateProgress();
    }
    toggle.addEventListener('click', function (e) { e.stopPropagation(); toggleDone(); });
    toggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleDone(); } });
    function toggleOpen() {
      var wasOpen = sec.classList.contains('open');
      secs.forEach(function (s) { s.classList.remove('open'); s.querySelector('h2').setAttribute('aria-expanded', 'false'); });
      if (!wasOpen) { sec.classList.add('open'); h.setAttribute('aria-expanded', 'true'); }
    }
    h.addEventListener('click', toggleOpen);
    h.addEventListener('keydown', function (e) { if (e.target === h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleOpen(); } });
  });
  if (secs[0]) { secs[0].classList.add('open'); secs[0].querySelector('h2').setAttribute('aria-expanded', 'true'); }
  // Deadlines are set by WebOuts on the Monday record and are read-only here.
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dueParts(s) {
    var p = String(s || '').split('-');
    if (p.length !== 3) return null;
    var y = parseInt(p[0], 10), m = parseInt(p[1], 10), d = parseInt(p[2], 10);
    return (y && m >= 1 && m <= 12 && d) ? { y: y, m: m, d: d } : null;
  }
  function applyDue(due) {
    due = due || {};
    secs.forEach(function (sec) {
      var h = sec.querySelector('h2');
      var old = h.querySelector('.due');
      if (old) h.removeChild(old);
      sec.classList.remove('has-due');
      var v = dueParts(due[sec.getAttribute('data-sec')]);
      var el = document.createElement('span');
      if (v) {
        var now = new Date();
        // Whole days between calendar dates, via UTC midnights so a clock change
        // cannot make a deadline look a day nearer or further than it is.
        var days = Math.round((Date.UTC(v.y, v.m - 1, v.d) -
                               Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
        // Within a week red, within a fortnight amber, further out blue.
        el.className = 'due' + (days < 0 ? ' past' : days <= 7 ? ' soon' : days <= 14 ? ' warn' : '');
        el.textContent = 'Deadline ' + MON[v.m - 1] + ' ' + v.d + (v.y === now.getFullYear() ? '' : ', ' + v.y);
        el.title = 'WebOuts sets this deadline. You don’t need to.';
      } else {
        // Undated sections keep the slot rather than leaving a gap, so headers stay
        // aligned and a date appearing later does not shove the row around.
        el.className = 'due none';
        el.textContent = 'No deadline set';
        el.title = 'WebOuts will set this date.';
      }
      h.insertBefore(el, h.querySelector('.done-toggle') || null);
      // Only a real date trims the "Completed" wording on narrow screens; the empty
      // placeholder is hidden there instead, so it can never cost a header a line.
      if (v) sec.classList.add('has-due');
    });
  }
  // Once WebOuts sets due dates, the form reorders itself to match: soonest first,
  // then anything undated in its original order. The visible numbers are rewritten to
  // the new positions, otherwise the client reads "1, 5, 2" and assumes it is broken.
  // Safe to move the nodes because every section declares its own data-sec slug, so
  // due dates and saved _done state follow the section rather than its position.
  function reorderByDue(due) {
    due = due || {};
    if (!Object.keys(due).length) return; // no dates set, leave the authored order alone
    var form = document.getElementById('wo-form');
    var submit = document.getElementById('wo-submit');
    var order = secs.map(function (sec, i) {
      var v = dueParts(due[sec.getAttribute('data-sec')]);
      return { sec: sec, i: i, key: v ? (v.y * 10000 + v.m * 100 + v.d) : Infinity };
    });
    // Infinity !== Infinity is false, so undated sections fall through to original order.
    order.sort(function (a, b) { return a.key !== b.key ? (a.key < b.key ? -1 : 1) : a.i - b.i; });
    order.forEach(function (o, idx) {
      form.insertBefore(o.sec, submit); // before the submit button, which stays last
      var n = o.sec.querySelector('h2 .num');
      if (n) n.textContent = String(idx + 1);
      o.sec.classList.toggle('open', idx === 0);
      var h = o.sec.querySelector('h2');
      if (h) h.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');
    });
  }
  // ---- project checklist (read-only) ----
  // WebOuts keeps this list as subitems on the Monday record and marks them done there.
  // The form only displays it, so the client sees both sides' progress and nobody holding
  // the link can tick anything. A record with no tasks shows no panel at all.
  function applyTasks(tasks) {
    var box = document.getElementById('wo-tasks');
    tasks = (tasks || []).filter(function (t) { return t && t.name && t.owner; });
    box.textContent = '';
    box.style.display = tasks.length ? '' : 'none';
    if (!tasks.length) return;
    function mk(tag, cls, text) { var e = document.createElement(tag); e.className = cls; if (text != null) e.textContent = text; return e; }
    function owners(t) { return String(t.owner).split(/\s*[+\/&,]\s*/).filter(Boolean); }
    function tone(o) { return /webouts/i.test(o) ? ' wo' : ' cl'; }
    // A shared task counts for each side that owns it.
    var tally = {}, names = [];
    tasks.forEach(function (t) {
      owners(t).forEach(function (o) {
        if (!tally[o]) { tally[o] = { done: 0, all: 0 }; names.push(o); }
        tally[o].all++; if (t.done) tally[o].done++;
      });
    });
    names.sort(function (a, b) { return (/webouts/i.test(b) ? 1 : 0) - (/webouts/i.test(a) ? 1 : 0); });
    var head = mk('div', 't-head');
    head.appendChild(mk('h2', 't-title', 'Project checklist'));
    names.forEach(function (o) { head.appendChild(mk('span', 't-sum' + tone(o), o + ' ' + tally[o].done + ' of ' + tally[o].all + ' done')); });
    box.appendChild(head);
    box.appendChild(mk('p', 't-note', 'Every step between today and your first filming day, and who owns it. WebOuts updates this list as work is finished.'));
    var group = null;
    tasks.forEach(function (t) {
      var g = String(t.group || '');
      if (g !== group) { group = g; if (g) box.appendChild(mk('div', 't-group', g)); }
      var row = mk('div', 't-row' + (t.done ? ' t-done' : ''));
      var tick = mk('span', 't-box', '\u2713');
      tick.setAttribute('role', 'img');
      tick.setAttribute('aria-label', t.done ? 'Done' : 'Not done yet');
      row.appendChild(tick);
      row.appendChild(mk('span', 't-name', t.name));
      var own = mk('span', 't-own');
      owners(t).forEach(function (o) { own.appendChild(mk('span', 't-pill' + tone(o), o)); });
      row.appendChild(own);
      box.appendChild(row);
    });
  }
  function applyDone(str) {
    doneSecs = {};
    String(str || '').split(',').filter(Boolean).forEach(function (slug) { doneSecs[slug] = 1; });
    secs.forEach(function (sec) {
      var on = !!doneSecs[sec.getAttribute('data-sec')];
      sec.classList.toggle('filled', on);
      var t = sec.querySelector('.done-toggle'); if (t) t.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    updateProgress();
  }

  // ---- communication samples (read-only previews with fill-in-the-blank tokens) ----
  // Tokens read straight from the live form, so samples personalize as the client types.
  // Manual edits to a blank are session-only: nothing here adds a saved field.
  var CREDS = { md: 1, do: 1, phd: 1, rn: 1, np: 1, pa: 1, dds: 1, dmd: 1, msn: 1, facs: 1, faap: 1, jr: 1, sr: 1, ii: 1, iii: 1 };
  function fval(key) { var el = root.querySelector('[data-key="' + key + '"]'); return el ? el.value.trim() : ''; }
  function cell(key, col) {
    var v = fval(key); if (!v) return '';
    return (v.split('\n')[0].split(' | ')[col] || '').trim();
  }
  function lastName(full) {
    var parts = String(full || '').replace(/,/g, ' ').split(/\s+/).filter(Boolean);
    while (parts.length > 1 && CREDS[parts[parts.length - 1].toLowerCase().replace(/\./g, '')]) parts.pop();
    return parts.length ? parts[parts.length - 1] : '';
  }
  var TOKENS = {
    org: { ph: 'Your Organization', get: function () { return fval('identity.displayName'); } },
    provider: { ph: 'Provider Name', get: function () { return cell('providers.launchList', 0); } },
    providerLastName: { ph: 'Last Name', get: function () { return lastName(cell('providers.launchList', 0)); } },
    specialty: { ph: 'Specialty', get: function () { return cell('providers.launchList', 1); } },
    contact: { ph: 'Your Contact', get: function () { return cell('contacts.list', 0); } },
    sender: { ph: 'Leadership Sender', get: function () { return fval('rollout.leadershipSender'); } },
    filmingLocation: { ph: 'Filming Location', get: function () { return fval('filming.location'); } },
    date: { ph: 'Filming Date', get: function () { return ''; } },
    time: { ph: 'Filming Time', get: function () { return ''; } },
    interviewDate: { ph: 'Interview Date', get: function () { return ''; } },
    interviewTime: { ph: 'Interview Time', get: function () { return ''; } },
    link: { ph: 'link', get: function () { return ''; } },
    bookingLink: { ph: 'your booking page', get: function () { return ''; } },
    sampleVideo: { ph: 'example video link', get: function () { return ''; } }
  };
  var overrides = {};
  function tokenVal(k) {
    if (overrides[k]) return { v: overrides[k], filled: true };
    var g = TOKENS[k].get();
    return g ? { v: g, filled: true } : { v: '[' + TOKENS[k].ph + ']', filled: false };
  }
  function fillText(s) {
    return String(s).replace(/\{\{(\w+)\}\}/g, function (m, k) { return TOKENS[k] ? tokenVal(k).v : m; });
  }
  function fillHTML(s) {
    return String(s).replace(/\{\{(\w+)\}\}/g, function (m, k) {
      if (!TOKENS[k]) return m;
      var t = tokenVal(k);
      return '<span class="wo-ml' + (t.filled ? ' filled' : '') + '" data-token="' + k + '" contenteditable="true" spellcheck="false" role="textbox" tabindex="0">' + esc(t.v) + '</span>';
    });
  }
  function repaintTokens(except) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-token]'), function (el) {
      if (el === except) return;
      var t = tokenVal(el.getAttribute('data-token'));
      if (el.textContent !== t.v) el.textContent = t.v;
      el.classList.toggle('filled', t.filled);
    });
  }

  var GROUPS = [
    { stage: 'announce', label: 'Your kickoff announcement', when: 'You send this to launch the project' },
    { stage: 'kickoff', label: 'Booking and scheduling', when: 'From your announcement until each provider books' },
    { stage: 'interview', label: 'Script interview', when: 'Before the 20 minute phone interview' },
    { stage: 'script', label: 'Script review and approval', when: 'From the first draft until the script is approved' },
    { stage: 'filming', label: 'Filming preparation', when: 'The two weeks before filming day' },
    { stage: 'client-sent', label: 'Your filming reminder', when: 'You send this less than a week before filming' }
  ];
  function countLabel(items) {
    var e = items.filter(function (s) { return s.channel === 'email'; }).length;
    var t = items.length - e;
    var parts = [];
    if (e) parts.push(e + (e === 1 ? ' email' : ' emails'));
    if (t) parts.push(t + (t === 1 ? ' text' : ' texts'));
    return parts.join(', ');
  }
  function tagsHTML(s) {
    var h = '<span class="wo-cs-tag ' + (s.channel === 'sms' ? 'sms">Text' : 'email">Email') + '</span>';
    if (s.sentBy !== 'WebOuts') h += '<span class="wo-cs-tag you">You send this</span>';
    return h;
  }
  function cardHTML(s) {
    return '<button type="button" class="wo-cs-card" data-id="' + esc(s.id) + '">'
      + '<span class="wo-cs-tags">' + tagsHTML(s) + '</span>'
      + '<span class="wo-cs-t">' + esc(s.title) + '</span>'
      + '<span class="wo-cs-b">' + esc(s.blurb) + '</span>'
      + '<span class="wo-cs-w">' + esc(s.timing) + '</span>'
      + '<span class="wo-cs-open">Click to read it &rsaquo;</span>'
      + '</button>';
  }
  var listEl = document.getElementById('wo-cs-list');
  function renderSamples() {
    var n = 0;
    listEl.innerHTML = GROUPS.map(function (g) {
      var items = SAMPLES.filter(function (s) { return s.stage === g.stage; });
      if (!items.length) return '';
      n++;
      return '<div class="wo-cs-grp">'
        + '<button type="button" class="wo-cs-grph" aria-expanded="false">'
        + '<span class="wo-cs-gnum" aria-hidden="true">' + n + '</span>'
        + '<span class="wo-cs-gtw"><span class="wo-cs-gt">' + esc(g.label) + '</span>'
        + '<span class="wo-cs-gw">' + esc(g.when) + '</span></span>'
        + '<span class="wo-cs-gc">' + countLabel(items) + '</span>'
        + '<span class="wo-cs-gchev" aria-hidden="true"></span>'
        + '</button>'
        + '<div class="wo-cs-grid">' + items.map(cardHTML).join('') + '</div></div>';
    }).join('');
  }

  // ---- sample modal ----
  var ovEl = document.getElementById('wo-cs-ov');
  var mdTitle = document.getElementById('wo-cs-mt');
  var mdWhen = document.getElementById('wo-cs-mw');
  var mdBody = document.getElementById('wo-cs-mb');
  var mdNote = document.getElementById('wo-cs-note');
  var mdCopy = document.getElementById('wo-cs-copy');
  var mdClose = document.getElementById('wo-cs-x');
  var lastFocus = null, openSample = null;

  function bodyHTML(s) {
    if (s.channel === 'sms') {
      return '<div class="wo-cs-phone"><div class="wo-cs-phoneh">Text message from WebOuts</div>'
        + '<div class="wo-cs-bub">' + fillHTML(esc(s.body)) + '</div></div>';
    }
    return '<div class="wo-cs-sheet"><div class="wo-cs-mail">'
      + '<div class="wo-cs-mailr"><b>From:</b> ' + fillHTML(esc(s.from)) + '</div>'
      + '<div class="wo-cs-mailr"><b>To:</b> ' + fillHTML(esc(s.to || '{{provider}}')) + '</div>'
      + '<div class="wo-cs-mailr"><b>Subject:</b> ' + fillHTML(esc(s.subject)) + '</div>'
      + '</div><div class="wo-cs-body">' + fillHTML(s.body) + '</div></div>';
  }
  function openModal(id) {
    var s = null;
    SAMPLES.forEach(function (x) { if (x.id === id) s = x; });
    if (!s) return;
    openSample = s;
    lastFocus = document.activeElement;
    mdTitle.textContent = s.title;
    mdWhen.textContent = s.timing;
    mdBody.innerHTML = bodyHTML(s);
    mdNote.textContent = s.sentBy === 'WebOuts'
      ? 'WebOuts sends this one automatically.'
      : 'Your team sends this one. Copy the text and send it from your own email.';
    mdCopy.style.display = s.copyable ? '' : 'none';
    mdCopy.textContent = 'Copy email text';
    ovEl.hidden = false;
    document.body.style.overflow = 'hidden';
    mdClose.focus();
  }
  function closeModal() {
    ovEl.hidden = true;
    openSample = null;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  listEl.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var head = e.target.closest('.wo-cs-grph');
    if (head) { // stages open independently, so a client can compare two at once
      var open = head.parentElement.classList.toggle('open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    var card = e.target.closest('.wo-cs-card');
    if (card) openModal(card.getAttribute('data-id'));
  });
  mdClose.addEventListener('click', closeModal);
  ovEl.addEventListener('click', function (e) { if (e.target === ovEl) closeModal(); });
  ovEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(
      ovEl.querySelectorAll('button, [contenteditable="true"]'),
      function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  mdCopy.addEventListener('click', function () {
    if (!openSample) return;
    var sheet = mdBody.querySelector('.wo-cs-body') || mdBody;
    var txt = 'Subject: ' + fillText(openSample.subject) + '\n\n' + (sheet.innerText || sheet.textContent || '').trim();
    var btn = this;
    function done() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy email text'; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
    else done();
  });

  // typing in a blank updates every other copy of that blank, but not the one being edited
  root.addEventListener('input', function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-token')) {
      var k = t.getAttribute('data-token');
      var v = t.textContent.trim();
      if (v && v !== '[' + TOKENS[k].ph + ']') overrides[k] = v; else delete overrides[k];
      t.classList.toggle('filled', tokenVal(k).filled); // style the edited blank without moving the caret
      repaintTokens(t);
      return;
    }
    if (t && (t.getAttribute && t.getAttribute('data-key') || (t.closest && t.closest('.sstab')))) { repaintTokens(); updateSubmit(); }
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.getAttribute && e.target.getAttribute('data-token')) {
      e.preventDefault(); e.target.blur();
    }
  });
  // leaving a blank empty puts its placeholder back
  root.addEventListener('focusout', function (e) {
    if (e.target && e.target.getAttribute && e.target.getAttribute('data-token')) repaintTokens();
  });
  renderSamples();

  // ---- provider bulk paste (Excel / Sheets -> table rows) ----
  var provPasteWrap = document.getElementById('wo-prov-paste');
  document.getElementById('wo-prov-paste-toggle').addEventListener('click', function () {
    provPasteWrap.style.display = provPasteWrap.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('wo-prov-paste-add').addEventListener('click', function () {
    var txt = document.getElementById('wo-prov-paste-txt');
    var text = txt.value;
    if (!text.trim()) return;
    var delim = text.indexOf('\t') >= 0 ? '\t' : ',';
    var rows = text.split(/\r?\n/).map(function (l) { return l.split(delim).map(function (c) { return c.trim(); }); })
      .filter(function (c) { return c.some(function (x) { return x; }); });
    if (rows.length > 1) { var head = rows[0].join(' ').toLowerCase(); if ((head.indexOf('name') >= 0 || head.indexOf('special') >= 0) && head.indexOf('@') < 0) rows.shift(); }
    tableCtls.providers.addRows(rows);
    txt.value = ''; provPasteWrap.style.display = 'none';
  });

  fields.forEach(function (el) {
    el.addEventListener('input', queueSave);
    el.addEventListener('change', queueSave);
    el.addEventListener('blur', function () { clearTimeout(saveTimer); doSave(); });
  });
  window.addEventListener('beforeunload', function () {
    // preview first: this beacon is the one write that bypasses the UI entirely,
    // and it has escaped request interception during testing before now.
    if (preview || locked || halted || !loaded) return;
    // Only what this tab actually changed. A tab left open all day used to beacon its
    // whole morning snapshot on close, reverting everyone else's afternoon work.
    var data = changed();
    if (!Object.keys(data).length) return;
    try { navigator.sendBeacon(API, new Blob([JSON.stringify({ action: 'save', token: token, data: data })], { type: 'application/json' })); } catch (e) {}
  });

  document.getElementById('wo-copy').addEventListener('click', function () {
    navigator.clipboard && navigator.clipboard.writeText(location.href);
    this.textContent = 'Copied';
    var b = this; setTimeout(function () { b.textContent = 'Copy link'; }, 2000);
  });

  // ---- submit gate: the few fields the provisioning engine cannot start without,
  // plus the practical minimum to actually run a shoot (a contact, providers, where
  // and when). Everything else stays optional, matching what provision.py consumes. ----
  var REQS = [
    { key: 'identity.displayName', label: 'Organization name', sec: 'org' },
    { key: 'identity.emailDomains', label: 'Provider email domain(s)', sec: 'org' },
    { key: 'contacts.list', cols: [0, 2], label: 'At least one main contact, with a name and email', sec: 'people' },
    { key: 'providers.launchList', cols: [0], label: 'At least one provider to feature', sec: 'providers' },
    { key: 'filming.location', label: 'A filming address', sec: 'filming' },
    { key: 'filming.preferredDates', cols: [0], label: 'At least one preferred filming date', sec: 'filming' }
  ];
  function reqMet(r) {
    var raw = fval(r.key);
    if (!r.cols) return !!raw;
    // table fields serialize as "col | col | col" per line; a req is met when one
    // line has all its named columns filled (e.g. a contact with both name and email).
    return String(raw || '').split('\n').some(function (line) {
      var parts = line.split(' | ');
      return r.cols.every(function (c) { return (parts[c] || '').trim(); });
    });
  }
  function missingReqs() { return REQS.filter(function (r) { return !reqMet(r); }); }
  function updateSubmit() {
    var btn = document.getElementById('wo-submit');
    if (!btn || preview || locked) return; // preview/lock own the button's state
    var miss = missingReqs();
    if (miss.length) {
      btn.classList.add('needs');
      btn.title = 'A few essentials are still needed before you can submit:\n• ' +
        miss.map(function (m) { return m.label; }).join('\n• ');
    } else {
      btn.classList.remove('needs');
      btn.title = '';
    }
  }
  function updateProgress() {
    var total = secs.length;
    var done = secs.filter(function (s) { return s.classList.contains('filled'); }).length;
    var fill = document.getElementById('wo-progfill');
    var txt = document.getElementById('wo-progtxt');
    if (fill) fill.style.width = (total ? Math.round(done / total * 100) : 0) + '%';
    if (txt) txt.textContent = done + ' of ' + total + ' sections done';
  }

  document.getElementById('wo-submit').addEventListener('click', function () {
    var miss = missingReqs();
    if (miss.length) {
      // Greyed state: reassert the hover hint and take them to the first gap.
      updateSubmit();
      var target = root.querySelector('#wo-form .sec[data-sec="' + miss[0].sec + '"]');
      if (target) {
        secs.forEach(function (s) { s.classList.remove('open'); s.querySelector('h2').setAttribute('aria-expanded', 'false'); });
        target.classList.add('open');
        target.querySelector('h2').setAttribute('aria-expanded', 'true');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    var total = secs.length;
    var done = secs.filter(function (s) { return s.classList.contains('filled'); }).length;
    // Confirm only when sections are still unchecked — a fully-ticked form is a
    // deliberate submit and goes straight through.
    if (done < total &&
        !confirm('Only ' + done + ' of ' + total + ' sections are marked Completed. You can still submit now and keep editing until WebOuts locks it in. Submit for review anyway?')) return;
    doSave({ _stage: 'Submitted for Review' });
    document.getElementById('wo-form').style.display = 'none';
    document.getElementById('wo-done').style.display = 'block';
  });

  function lockIfNeeded(stage) {
    if (stage === 'Locked' || stage === 'Provisioned' || stage === 'WebOuts Review') {
      locked = true;
      document.getElementById('wo-lockmsg').style.display = 'block';
      fields.forEach(function (el) { el.disabled = true; });
      Array.prototype.forEach.call(root.querySelectorAll('.sstab input, .sstab button, .pasteui'), function (el) { el.disabled = true; });
      gfxUp.disable(); brandUp.disable();
      document.getElementById('wo-submit').style.display = 'none';
    }
  }

  function handleLoad(res) {
    endLoading();
    if (!res || res.ok !== true) { // never render a blank form over answers we failed to read
      loaded = false;
      halt(res && res.error);
      fields.forEach(function (el) { el.disabled = true; });
      return;
    }
    var data = res.data || {};
    baseline = {};
    Object.keys(data).forEach(function (k) { baseline[k] = data[k] == null ? '' : String(data[k]); });
    if (res && res.itemId) itemId = res.itemId;
    apply(data);
    Object.keys(TABLES).forEach(function (id) { tableCtls[id].build(data[TABLES[id].key] || ''); });
    gfxUp.load(data['graphics.files']);
    brandUp.load(data['brandGuide.files']);
    applyDone(data._done);
    applyDue(res && res.due);
    reorderByDue(res && res.due);
    applyTasks(res && res.tasks);
    updateProgress();
    updateSubmit();
    // Read the real Monday Stage, not the copy in the blob. The blob only ever held
    // 'Submitted for Review', so a staff lock never actually reached the client.
    lockIfNeeded(res.stage || data._stage);
    var has = Object.keys(data).length > 0;
    loaded = true;
    if (locked) setSave('idle', 'Locked');
    else if (has) setSave('saved', 'All changes saved');
    else setSave('idle', 'Ready to start typing');
  }
  function loadForm(attempt) {
    setSave('saving', 'Loading…');
    postJSON(API, { action: 'load', token: token })
      .then(handleLoad)
      .catch(function () {
        if (attempt < 2) { setTimeout(function () { loadForm(attempt + 1); }, 700 * (attempt + 1)); return; }
        endLoading(); // give them the form back rather than leaving them on a spinner
        loaded = true; // let the client still work; sparse saves won't clobber stored data
        setSave('error', 'Couldn’t load your info — check your connection and refresh');
      });
  }
  // ---- splash wiring ----
  if (!token) {
    var prior = saved('woOnbToken');
    document.getElementById('wo-splash-new').addEventListener('click', function () {
      var t = newToken();
      remember('woOnbToken', t);
      showForm(t);
    });
    // The paste field starts hidden so the splash is one clear choice rather than a
    // wall of inputs. Revealing it focuses it, so the click and the typing are one move.
    var pasteEl = document.getElementById('wo-splash-paste');
    var haveBtn = document.getElementById('wo-splash-have');
    // One button does both jobs: if this browser already started an onboarding it picks
    // straight up where they left off, and only when there is nothing to resume does it
    // ask for a link. No verification round-trip on the stored token on purpose - a draft
    // that was started but never typed into has no record yet, and checking would wrongly
    // turn their own unfinished draft away.
    haveBtn.addEventListener('click', function () {
      if (prior) { showForm(prior); return; }
      var open = !pasteEl.hidden;
      pasteEl.hidden = open;
      haveBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (!open) document.getElementById('wo-splash-link').focus();
    });
    var errEl = document.getElementById('wo-splash-err');
    var openBtn = document.getElementById('wo-splash-open');
    function openPasted() {
      var t = tokenFrom(document.getElementById('wo-splash-link').value);
      if (!t) {
        errEl.innerHTML = 'That doesn’t look like an onboarding link. It should look like https://webouts.com/onboarding?c=… — paste the whole thing.';
        errEl.style.display = '';
        return;
      }
      errEl.style.display = 'none';
      // Any 8-character word is a structurally valid token, so a mistyped link would
      // silently open an empty form that looks exactly like lost answers. Check first.
      // A miss is not fatal though: a client who was sent a link but never typed has no
      // record yet, so offer to open it anyway rather than blocking them out.
      openBtn.disabled = true;
      var was = openBtn.textContent;
      openBtn.textContent = 'Checking…';
      postJSON(API, { action: 'load', token: t })
        .then(function (res) {
          if (res && res.ok === true && res.exists === false) {
            errEl.innerHTML = 'We couldn’t find any saved answers for that link. Check you copied the whole thing. ';
            var go = document.createElement('button');
            go.type = 'button'; go.className = 'sp-quiet'; go.textContent = 'Open it anyway';
            go.addEventListener('click', function () { showForm(t); });
            errEl.appendChild(go);
            errEl.style.display = '';
            return;
          }
          showForm(t); // found it, or the API refused for a reason the form itself will show
        })
        .catch(function () { showForm(t); }) // our outage is not their problem
        .finally(function () { openBtn.disabled = false; openBtn.textContent = was; });
    }
    document.getElementById('wo-splash-open').addEventListener('click', openPasted);
    document.getElementById('wo-splash-link').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); openPasted(); }
    });
    // Preview: render the form with no token at all, so there is nothing to save to.
    // Every write path is also gated on `preview`, but an empty token means even a
    // stray request would be refused by the API rather than land somewhere.
    document.getElementById('wo-splash-peek').addEventListener('click', function () {
      preview = true;
      token = '';
      splash.style.display = 'none';
      document.getElementById('wo-previewmsg').style.display = '';
      document.getElementById('wo-form').style.display = '';
      document.getElementById('wo-welcome').style.display = '';
      document.getElementById('wo-welcomesub').style.display = '';
      gfxUp.disable(); brandUp.disable();
      applyDue({}); // preview never loads, so draw the empty date slots itself
      var sub = document.getElementById('wo-submit');
      if (sub) { sub.disabled = true; sub.textContent = 'Submitting is off in preview'; }
      updateProgress();
      loaded = true;
      setSave('idle', 'Preview — nothing is saved');
    });
  } else {
    loadForm(0);
  }
})();
