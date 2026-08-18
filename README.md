# ShopTalk Submission Portal

ShopTalk Hub — Simple AI Development Prompt

Build a simple, elegant, responsive web application called ShopTalk Hub.

Project Purpose

ShopTalk Hub is a simple college presentation submission website.

Students will use the website to submit their ShopTalk presentation. They will enter their name, roll number, topic, and upload their PPT/PPTX file.

The uploaded presentation should be stored securely using Supabase Storage, while the submission details should be stored in a Supabase Database.

Keep the project very simple, clean, elegant, and beginner-friendly.

Do NOT build a complex dashboard.

Technology

Use:

HTML

CSS

JavaScript

Supabase

Use Supabase for:

Database

File storage

Do not use unnecessary frameworks or complicated technologies.

Website Structure

The website should have only two main pages:

index.html
submissions.html


index.html

Student submission page.

submissions.html

A simple page for viewing submitted presentations.

This is NOT a full admin dashboard. Keep it extremely simple.

1. Homepage / Submission Page

The homepage should immediately communicate the purpose of the website.

Header

Display:

ShopTalk Hub

Navigation:

Home

Submissions

Keep the navigation minimal.

Hero Section

Display:

ShopTalk Hub

Submit Your ShopTalk Presentation

Short description:

“Upload your presentation quickly and securely in one place.”

Add a clean presentation/upload icon.

Add a subtle animation if appropriate, but don't overdo animations.

2. Submission Form

Create a beautiful centered submission card.

Fields:

Student Name

Text input.

Placeholder:

Enter your full name

Roll Number

Text input.

Placeholder:

Enter your roll number

Topic

Text input.

Placeholder:

Enter your presentation topic

Presentation

File upload field.

Only allow:

.ppt

and

.pptx

The upload area should look modern and elegant.

Example:

Drag & Drop your PPT here

or

Browse Files

After selecting a file, display:

Selected: presentation.pptx

3. File Validation

Before uploading:

Student Name cannot be empty

Roll Number cannot be empty

Topic cannot be empty

A file must be selected

Only .ppt and .pptx files are allowed

Set a reasonable maximum file size

Display clear error messages.

Example:

Please upload a PowerPoint file (.ppt or .pptx).

4. Automatic File Renaming

This is important.

When the student uploads a presentation, automatically rename the file before storing it.

The final filename MUST follow this format:

ROLLNO_NAME.pptx


For example:

23CS041_Sarthak.pptx


If the uploaded file is a .ppt, preserve the .ppt extension:

23CS041_Sarthak.ppt


Use the student's entered roll number and name.

Clean the name before creating the filename so spaces and unsafe characters do not cause problems.

For example:

Student Name:

Sarthak Kumar

Roll Number:

23CS041

File becomes:

23CS041_Sarthak_Kumar.pptx


Use underscores instead of spaces.

5. Supabase Storage

Create a Supabase Storage bucket called:

presentations


Store all submitted presentations inside this bucket.

The stored filename should be the automatically generated:

ROLLNO_NAME.extension


Do not use the original uploaded filename for storage.

6. Supabase Database

Create a table:

submissions


Columns:

id
student_name
roll_number
topic
file_name
file_path
submitted_at


When a student submits:

Validate the form.

Generate the new filename.

Upload the file to Supabase Storage.

Save the student's information in the database.

Show a success message.

7. Submission Success

After successful submission, don't redirect to another complicated page.

Simply replace the form with a clean success card.

Display:

🎉 Submission Successful!

Your ShopTalk presentation has been submitted successfully.

Show:

Name: Sarthak Kumar
Roll No.: 23CS041
Topic: Artificial Intelligence

And:

File: 23CS041_Sarthak_Kumar.pptx

Add:

Submit Another Presentation

button.

8. Submissions Page

Create a very simple page called:

Submitted Presentations

This is NOT a dashboard.

It should simply display submitted presentations in clean cards or a simple table.

Each submission should show:

Student Name

Roll Number

Topic

File Name

Submission Date

Download button

Example:

────────────────────────────────────

Sarthak Kumar
Roll No: 23CS041

Artificial Intelligence

📄 23CS041_Sarthak_Kumar.pptx

[ Download ]

────────────────────────────────────


Keep this page minimal.

9. Search

At the top of the submissions page, add a small search box:

Search submissions...

Allow searching by:

Name

Roll Number

Topic

No complicated filtering system is required.

10. Download

Each submission should have a:

Download

button.

The button should download the corresponding PPT/PPTX file from Supabase Storage.

Handle missing files gracefully.

11. Design

The most important design requirement is:

Simple + Elegant + Professional

The website should look like a polished modern college project.

Suggested style:

Clean white/light background

Dark navy/black text

One tasteful accent color

Rounded cards

Subtle shadows

Modern typography

Plenty of whitespace

Simple icons

Smooth hover effects

Very subtle animations

Do NOT make it flashy.

Avoid:

Excessive gradients

Huge animations

Neon colors

Too many cards

Unnecessary decorative elements

Think:

Minimal SaaS + College Project

12. Responsive Design

The website must work properly on:

Desktop

Laptop

Tablet

Mobile

The submission form should remain easy to use on mobile.

The submissions page should also be mobile-friendly.

13. Error Handling

Handle:

Empty fields

Invalid file type

File too large

Upload failure

Database failure

Download failure

Network errors

Show friendly messages rather than technical Supabase errors.

14. Security

Do not expose Supabase service-role keys.

Use the public Supabase client configuration appropriately.

Do not put secret keys inside frontend code.

Configure Supabase Storage and database policies appropriately.

15. Simple Folder Structure

Use a beginner-friendly structure:

shoptalk-hub/
│
├── index.html
├── submissions.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── supabase.js
│   ├── upload.js
│   └── submissions.js
│
└── assets/
    └── logo.svg


Keep the project easy to understand.

16. Important: Do Not Add

Do NOT create:

Admin dashboard

Login system

Student accounts

Registration

Chat

Comments

Likes

AI chatbot

Payment system

Complex analytics

Notifications

Branch field

Section field

Unnecessary features

The project has one simple purpose:

Collect ShopTalk presentations in an organized way.

Final User Flow

The complete experience should be:

Student opens ShopTalk Hub
        ↓
Enters Name
        ↓
Enters Roll Number
        ↓
Enters Topic
        ↓
Uploads PPT/PPTX
        ↓
Website renames it automatically
        ↓
ROLLNO_NAME.pptx
        ↓
File stored in Supabase
        ↓
Submission information stored in database
        ↓
Success message appears
        ↓
Submission appears on Submitted Presentations page
        ↓
Presentation can be downloaded


The final website should feel small, polished, useful, and realistic, not like an over-engineered application.

Build the UI first, then integrate Supabase. Keep the code clean and explain the important parts with comments so the project remains understandable to a beginner.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shoptalk-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2befce38-9047-42fc-a35b-2c09a587cf6c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
