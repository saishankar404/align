# Chapter 0: How The Web Actually Works

Before you write a single line of JavaScript, you need to understand what you are building for. This chapter has no code. It is pure concepts. By the end, you will have a mental model of how the web works that will make everything else click.

---

## The Vocabulary

Before we dive in, let's define the words you will hear constantly:

**Client** - The program requesting something. Usually your web browser. Sometimes called "the frontend."

**Server** - The program responding to requests. A computer somewhere running code that sends back data. Sometimes called "the backend."

**Request** - A message from client to server asking for something. "Give me this webpage" or "Save this data."

**Response** - A message from server to client with the answer. "Here's the HTML" or "Data saved successfully."

**Protocol** - A set of rules for how two programs communicate. HTTP is the protocol of the web.

**URL** - Uniform Resource Locator. The address of something on the web. `https://align.app/home` is a URL.

**Database** - A program that stores data permanently. When the server restarts, the database still has the data.

**API** - Application Programming Interface. A defined way for programs to talk to each other. When your browser talks to a server, it uses the server's API.

---

## Section 1: What Happens When You Visit a Website

You type `https://google.com` into your browser and press Enter. Here is what actually happens:

### Step 1: DNS Lookup

Your browser does not know where "google.com" is. It only understands IP addresses like `142.250.80.46`.

So it asks a DNS (Domain Name System) server: "What is the IP address for google.com?"

DNS is like a phone book for the internet. It translates human-readable names into machine-readable addresses.

```
Your Browser: "What's the IP for google.com?"
DNS Server: "It's 142.250.80.46"
```

**Why this matters:** When you develop locally, you use `localhost` which translates to `127.0.0.1` - your own computer. The DNS system is why you can use words instead of numbers.

### Step 2: TCP Connection

Your browser now knows WHERE to send the request. Next it establishes a connection.

TCP (Transmission Control Protocol) is like a phone call. Before you can talk, you need to dial and wait for the other side to pick up. This is called the "TCP handshake."

```
Browser: "Hey, can we talk?" (SYN)
Server: "Yes, I'm here, let's talk" (SYN-ACK)
Browser: "Great, starting now" (ACK)
```

**Why this matters:** This handshake takes time. Every new connection has this overhead. That is why websites try to reuse connections and why "latency" (the delay) matters.

### Step 3: HTTP Request

Now the browser sends an HTTP request. HTTP stands for HyperText Transfer Protocol. It is the language browsers and servers speak.

A request looks something like this:

```
GET /search?q=weather HTTP/1.1
Host: google.com
User-Agent: Chrome/120.0
Accept: text/html
```

Let's break that down:

- `GET` - The HTTP method. "I want to GET something." Other methods include POST (send data), PUT (update data), DELETE (remove data).
- `/search?q=weather` - The path. What specific thing I want.
- `HTTP/1.1` - The protocol version.
- `Host: google.com` - Which website (one server can host many sites).
- `User-Agent` - What browser is asking (Chrome, Firefox, etc).
- `Accept` - What format I want back (HTML, JSON, etc).

**Why this matters:** When you build web apps, you will write code that handles these requests. Understanding what is in a request helps you debug when things go wrong.

### Step 4: Server Processing

The server receives the request and runs code to figure out what to send back.

This might involve:
- Looking up data in a database
- Checking if the user is logged in
- Generating HTML dynamically
- Fetching data from other services

For a Google search, the server:
1. Parses the search query "weather"
2. Queries its massive database of web pages
3. Ranks results by relevance
4. Generates an HTML page with the results

### Step 5: HTTP Response

The server sends back an HTTP response:

```
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 45231

<!DOCTYPE html>
<html>
<head><title>weather - Google Search</title></head>
<body>
  ... (the actual HTML)
</body>
</html>
```

The parts:
- `200 OK` - Status code. 200 means success. You will learn others.
- `Content-Type: text/html` - What format the response is in.
- `Content-Length` - How many bytes.
- Then a blank line, then the actual content.

### Step 6: Browser Rendering

Your browser receives the HTML and:

1. **Parses the HTML** - Turns text into a tree structure (the DOM)
2. **Requests additional resources** - Images, CSS files, JavaScript files each trigger new HTTP requests
3. **Applies CSS** - Styles the elements
4. **Runs JavaScript** - Executes code that can modify the page
5. **Paints pixels** - Actually draws to your screen

**The full picture:**

```
You                          Internet                    Server
 |                              |                          |
 |  1. Type URL, press Enter    |                          |
 |----------------------------->|                          |
 |                              |  2. DNS: Find IP         |
 |                              |------------------------->|
 |                              |<-------------------------|
 |                              |  3. TCP: Connect         |
 |                              |------------------------->|
 |                              |<-------------------------|
 |  4. HTTP Request             |                          |
 |----------------------------->|------------------------->|
 |                              |  5. Server processes     |
 |                              |          ...             |
 |  6. HTTP Response            |                          |
 |<-----------------------------|<-------------------------|
 |                              |                          |
 |  7. Browser renders          |                          |
 |  (parse, style, paint)       |                          |
```

---

## Section 2: What a Browser Actually Does

Your browser is incredibly complex software. Here is what it does, simplified:

### The Rendering Engine

The rendering engine turns HTML and CSS into pixels. The main ones are:
- **Blink** - Used by Chrome, Edge, Opera
- **WebKit** - Used by Safari
- **Gecko** - Used by Firefox

The process:

```
HTML Text           CSS Text
    |                   |
    v                   v
HTML Parser         CSS Parser
    |                   |
    v                   v
   DOM    +    CSSOM (CSS Object Model)
    |___________|
          |
          v
    Render Tree
    (what to display and how)
          |
          v
       Layout
    (where everything goes)
          |
          v
       Paint
    (actual pixels)
```

### The JavaScript Engine

Browsers have a separate engine for running JavaScript:
- **V8** - Chrome, Edge, Node.js
- **SpiderMonkey** - Firefox
- **JavaScriptCore** - Safari

JavaScript is "just in time" compiled. The engine:
1. Parses your code into an Abstract Syntax Tree
2. Compiles it to bytecode
3. Runs the bytecode
4. Optimizes hot paths (code that runs often)

**Why this matters:** JavaScript runs in a single thread. This means one thing at a time. That is why "async" programming exists, which you will learn in Chapter 4.

### The Event Loop

The browser's JavaScript engine has something called the "event loop." This is critical to understand.

```
        Call Stack              Event Queue
        __________              ___________
       |          |            |           |
       | function |            | click     |
       |__________|            | timer     |
       | function |            | fetch     |
       |__________|            |___________|
            |                       |
            |_____Event Loop________|
                    |
                    v
            (runs next thing)
```

The event loop:
1. Runs code from the call stack until it is empty
2. Checks if there are events waiting (clicks, timers, network responses)
3. Moves the first event to the call stack
4. Repeat forever

**Why this matters:** This is why a slow function freezes the whole page. It blocks the event loop. And this is why we use "async" code for things like network requests.

### Browser Security: The Sandbox

Browsers are paranoid, and for good reason. You visit websites written by strangers. That code runs on your computer.

The browser sandboxes JavaScript:
- Cannot read files from your computer
- Cannot access other browser tabs
- Cannot make requests to other websites (usually)
- Cannot access hardware directly

This is why some things require permissions (camera, microphone, location, notifications).

---

## Section 3: What a Server Actually Does

A server is just a computer running a program that listens for HTTP requests and sends responses.

### The Server Program

You can write servers in many languages:
- JavaScript (Node.js)
- Python (Django, Flask)
- Ruby (Rails)
- Go
- Java
- And many more

In the Align codebase, the server is Next.js running on Node.js.

### What Servers Can Do (That Browsers Cannot)

Servers can:
- Read and write to a database
- Access the file system
- Store secrets (API keys, passwords)
- Make requests to other servers without restrictions
- Run CPU-intensive tasks without freezing a UI

**Why this matters:** This is why you cannot just put everything in the browser. Some things MUST run on a server for security or capability reasons.

### Server vs Serverless

Traditional servers:
- You run a computer 24/7
- It waits for requests
- You pay for uptime

Serverless (what Supabase Edge Functions use):
- Code runs only when called
- Spins up, handles request, shuts down
- You pay for execution time

Align uses serverless functions for sending push notifications. The function is not running constantly. It wakes up when needed.

---

## Section 4: Why Databases Exist

Here is the problem: when you restart a server, all variables disappear. Memory is cleared.

```javascript
let users = [];  // Lives in memory
users.push({ name: "Alice" });

// Server restarts...
// users is now [] again
```

Databases solve this. They store data on disk, which survives restarts, crashes, and even power outages.

### Types of Databases

**Relational Databases (SQL)**
- Data in tables with rows and columns
- Tables can reference each other (relations)
- Use SQL (Structured Query Language) to query
- Examples: PostgreSQL, MySQL, SQLite
- Align uses PostgreSQL (via Supabase)

```
users table:
| id  | name    | email           |
|-----|---------|-----------------|
| 1   | Alice   | alice@email.com |
| 2   | Bob     | bob@email.com   |

posts table:
| id  | user_id | content         |
|-----|---------|-----------------|
| 1   | 1       | Hello world     |
| 2   | 1       | Another post    |
| 3   | 2       | Bob's post      |
```

**Document Databases (NoSQL)**
- Data in JSON-like documents
- No fixed schema
- Examples: MongoDB, Firebase Firestore

```json
{
  "id": "1",
  "name": "Alice",
  "email": "alice@email.com",
  "posts": [
    { "id": "1", "content": "Hello world" },
    { "id": "2", "content": "Another post" }
  ]
}
```

**Why Align Uses PostgreSQL:**
- User data has clear relationships (users have cycles, cycles have moves)
- SQL databases enforce structure (you cannot save invalid data)
- Row Level Security (RLS) lets the database enforce who can see what
- Supabase provides PostgreSQL with a nice API

### Local Databases

Not all databases are on servers. IndexedDB is a database in your browser.

Align uses Dexie (a wrapper around IndexedDB) to store data locally. This is why the app works offline. The data is saved in your browser's local database.

When you come back online, it syncs to the server database.

---

## Section 5: Putting It All Together

Here is how Align uses all of this:

### The Architecture

```
Your Phone/Browser                        The Cloud
       |                                      |
       |  IndexedDB (Dexie)                   |  PostgreSQL (Supabase)
       |  - Your data, locally               |  - Your data, backed up
       |  - Works offline                    |  - Shared across devices
       |                                      |
       |                                      |
       |           ----Sync---->              |
       |           <----Sync----              |
       |                                      |
       |                                      |
       |  Next.js App                        |  Supabase Auth
       |  - React components                 |  - Handles login
       |  - Runs in browser                  |  - Issues tokens
       |                                      |
       |                                      |
       |  Service Worker (PWA)               |  Edge Functions
       |  - Caches the app                   |  - Sends notifications
       |  - Handles push notifications       |
```

### When You Use Align

**Opening the app:**
1. Browser requests `align.app`
2. Server sends HTML + JavaScript
3. Service worker caches everything for offline use
4. App loads from cache (fast!)
5. React renders the UI
6. App checks IndexedDB for local data
7. If online, syncs with Supabase

**Adding a move:**
1. You tap "Add move"
2. React shows the form
3. You type and tap save
4. JavaScript writes to IndexedDB (instant)
5. UI updates immediately
6. Background sync pushes to Supabase
7. If offline, it queues and syncs later

**Getting a notification:**
1. Edge function runs on schedule
2. Checks database for who needs reminders
3. Sends push notification to your device
4. Service worker receives it
5. Shows notification even if app is closed

---

## Section 6: HTTP Status Codes You Need to Know

When servers respond, they include a status code. These tell you what happened:

### 2xx - Success
- **200 OK** - Everything worked
- **201 Created** - Successfully created something new
- **204 No Content** - Success, but nothing to return

### 3xx - Redirect
- **301 Moved Permanently** - Use a different URL from now on
- **302 Found** - Temporarily use a different URL
- **304 Not Modified** - You already have the latest version (caching)

### 4xx - Client Error (Your Fault)
- **400 Bad Request** - Your request is malformed
- **401 Unauthorized** - You need to log in
- **403 Forbidden** - You are logged in but not allowed to do this
- **404 Not Found** - This thing does not exist
- **422 Unprocessable Entity** - Data is invalid

### 5xx - Server Error (Server's Fault)
- **500 Internal Server Error** - Something broke on the server
- **502 Bad Gateway** - Server could not reach another server it needed
- **503 Service Unavailable** - Server is overloaded or down

**Why this matters:** When debugging, these codes tell you where the problem is. 4xx means fix your code. 5xx means the server has a bug.

---

## Section 7: HTTPS and Why the S Matters

HTTP sends data in plain text. Anyone between you and the server can read it.

HTTPS adds encryption. The S stands for "Secure." It uses TLS (Transport Layer Security) to encrypt the connection.

```
HTTP:
You: "My password is hunter2"
  |
  v
Anyone listening can read: "My password is hunter2"
  |
  v
Server receives: "My password is hunter2"

HTTPS:
You: "My password is hunter2"
  |
  | (encrypted with TLS)
  v
Anyone listening sees: "a7&hG#mK@9!xZ..."
  |
  v
Server decrypts: "My password is hunter2"
```

Modern browsers:
- Show a lock icon for HTTPS
- Warn you for HTTP sites
- Block some features on HTTP (geolocation, camera)

**Always use HTTPS in production.** Supabase provides HTTPS automatically.

---

## Mental Models to Take Away

### Model 1: Request/Response

Everything on the web is a conversation:
- Client asks
- Server answers
- That is it

Every click, every form submit, every image load - it is all requests and responses.

### Model 2: Client vs Server Trust

- **Never trust the client.** Users can modify their browser, send fake requests, lie about who they are.
- **Always trust the server** (that you control). This is where you put security checks, database access, secrets.

This is why you cannot put API keys in browser code. Anyone can see them.

### Model 3: State Lives Somewhere

Data has to live somewhere:
- **Browser memory** (JavaScript variables) - Gone when you refresh
- **Browser storage** (IndexedDB, localStorage) - Survives refresh, lives on one device
- **Server memory** - Gone when server restarts
- **Database** - Survives everything, accessible from anywhere

Align uses all of these. You will learn when to use which.

### Model 4: Latency is Real

Every network request takes time:
- DNS lookup: 1-50ms
- TCP handshake: 10-100ms
- Server processing: 1ms-10s
- Response transfer: depends on size and speed

This is why:
- We cache aggressively
- We write locally first (optimistic updates)
- We batch requests when possible
- We show loading states to users

---

## Go Figure It Out

These questions require research. Finding the answers yourself will cement your understanding.

1. **What is the difference between HTTP/1.1, HTTP/2, and HTTP/3?** Why did we need new versions? What problems did each solve?

2. **What is a CDN (Content Delivery Network)?** Why does nearly every major website use one? How does it relate to latency?

3. **What is CORS (Cross-Origin Resource Sharing)?** Why does the browser block requests to other domains? When is this a problem?

4. **What is a cookie?** How does it enable "sessions" so websites remember you are logged in? Why are there laws about cookies?

5. **What is the difference between "client-side rendering" and "server-side rendering"?** What are the trade-offs? (This is critical for understanding Next.js in Chapter 11.)

6. **What is DNS propagation?** Why can it take up to 48 hours for a new domain to work everywhere?

7. **What does "the cloud" actually mean?** When someone says their app is "in the cloud," what does that physically mean? Where is the computer?

---

## Connections to Coming Chapters

This chapter gave you the foundation. Here is how it connects to what's coming:

- **Chapter 1 (JavaScript Basics):** You will write code that runs in the browser, in this environment you now understand.

- **Chapter 4 (Async JavaScript):** The event loop and network requests you learned about here are why async programming exists.

- **Chapter 11 (Next.js):** Server components vs client components is fundamentally about WHERE code runs, server or browser.

- **Chapter 12 (API Routes):** You will write the server code that receives those HTTP requests and sends responses.

- **Chapter 13 (Dexie):** The offline database you learned about. You will use it for local storage.

- **Chapter 14 (Supabase):** The PostgreSQL database and the sync between local and server.

- **Chapter 15 (Security):** Trust, HTTPS, and protecting your users from attacks.

- **Chapter 17 (PWA):** Service workers, caching, and making the app work offline.

---

**Previous: [README](./README.md)**

**Next: [Chapter 1 - The Building Blocks](./part-1-javascript/01-building-blocks.md)**
