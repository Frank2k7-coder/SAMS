import express from "express";
import pkg from 'pg';
const { Pool } = pkg;
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import { v2 as cloudinary } from 'cloudinary';


const PORT = 5000;

const app = express();


cloudinary.config({
  cloud_name: "dmmldzjty",
  api_key: "553614156743867",
  api_secret: "_8Pr41mpsjYKQICZLLYUUwyEvOA",
});

const upload = multer({ dest: "uploads/" });
const server = createServer(app);
const io = new Server(server, {
  cors: {
   origin: "http://localhost:3000",
   methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(bodyParser.json());

// connect to the postgresql
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_2peclWQF1vqt@ep-broad-bar-ad0g2ty3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false
  }
});


pool.query("SELECT 1")
.then(() => console.log('✅ Connected to Neon PostgreSQL!'))
.catch(err => console.log('❌ Connection failed:', err.message));

pool.on('connect', () => {
  console.log('✅ frank am  Connected to Neon PostgreSQL successfully!');
});


// Socket.IO logic
const connectedUsers = {};
const onlineUsers = new Set();
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  let userId = null;

  socket.on("registerUser", (userData) => {
    userId = userData.id;
    connectedUsers[userId] = socket.id;
    onlineUsers.add(userId);

    console.log("🟢 Connected users:", connectedUsers);
    console.log(`✅ User ${userId} is now online`);

    socket.emit("online-users", Array.from(onlineUsers));

    socket.broadcast.emit("user-online", userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    for (const id in connectedUsers) {
      if (connectedUsers[id] === socket.id) {
        delete connectedUsers[id];
        break;
      }
    }

    if (userId) {
      onlineUsers.delete(userId);
      console.log(`⚫ User ${userId} is now offline`);
      socket.broadcast.emit("user-offline", userId);
    }
  });

  socket.on("sendMessage", (data) => {
    const { sender_id, receiver_id, message, is_file } = data;
    const sql = `INSERT INTO messages (sender_id, receiver_id, message, is_file, is_read) VALUES ($1, $2, $3, $4, false) RETURNING *`;
    pool.query(sql, [sender_id, receiver_id, message, is_file ? true : false], (err, result) => {
      if (err) {
        console.error("Error saving message:", err);
        return;
      }

      console.log(`Stored: ${sender_id} → ${receiver_id} | File: ${is_file} | Message: ${message}`);

      const receiverSocketId = connectedUsers[receiver_id];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          sender_id,
          receiver_id,
          message,
          is_file,
          timestamp: new Date().toISOString(),
        });

        // 🔔 Unread count update - PostgreSQL syntax
        const unreadSql = `
          SELECT COUNT(*) AS unreadcount
          FROM messages
          WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
        `;
        pool.query(unreadSql, [receiver_id, sender_id], (err2, result2) => {
          if (!err2 && result2.rows.length > 0) {
            io.to(receiverSocketId).emit("unreadUpdate", {
              from: sender_id,
              count: result2.rows[0].unreadcount, // ✅ PostgreSQL lowercase
            });
          }
        });
      }
    });
  });

  // TYPING INDICATOR EVENTS
  socket.on('typing-start', (data) => {
    const { receiverId, senderId } = data;
    
    console.log(`⌨️ User ${senderId} started typing to ${receiverId}`);
    
    const receiverSocketId = connectedUsers[receiverId];
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit('user-typing', {
        userId: senderId
      });
    }
  });

  socket.on('typing-stop', (data) => {
    const { receiverId, senderId } = data;
    
    console.log(`💤 User ${senderId} stopped typing to ${receiverId}`);
    
    const receiverSocketId = connectedUsers[receiverId];
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit('user-stopped-typing', {
        userId: senderId
      });
    }
  });
});

// Register user
app.post("/register", (req, res) => {
  const {
     name, 
    nationalId,
     role, 
    gender,
    date_of_birth,
    status,
    reason,   
    visitedKidName,
    visitedKidGrade,
    visitedKidFamily,
    visitedKidMother,
    alumniTime,
    alumniMeetingPerson,
    visitorOrigin,
    visitorTitle,
    groupLead,
    groupNumber,
    groupTime } = req.body;
  


if (!name || !nationalId || !role || !gender || !date_of_birth || !status || !reason) {
 return res.status(400).json({ message: "Please fill all fields" });
  }

 
  if (nationalId.length !== 16 || !/^\d+$/.test(nationalId)) {
    return res.status(400).json({ message: "National ID must be exactly 16 digits." });

  }


  if (role === "Parent") {
    if (!visitedKidName || !visitedKidGrade || !visitedKidFamily || !visitedKidMother) {
     return res.status(400).json({ message: "Please fill all fields for the parents" });
    }
  } else if (role === "Alumni") {
    if (!alumniTime || !alumniMeetingPerson) {
       return res.status(400).json({ message: "Please fill all fields for the alumni" });
    }
  } else if (role === "Visitor") {
    if (!visitorOrigin || !visitorTitle) {
       return res.status(400).json({ message: "Please fill all fields for the vistors" });
    }
  } else if (role === "Group") {
    if (!groupLead || !groupNumber || !groupTime) {
     return res.status(400).json({ message: "Please fill all fields for group" });
    }
  }



const sql = `
  INSERT INTO users 
  (name, national_id, role, status, gender, date_of_birth, reason,
   visited_kid_name, visited_kid_grade, visited_kid_family, visited_kid_mother,
   alumni_time, alumni_meeting_person,
   visitor_origin, visitor_title, 
   group_lead, group_number, group_time)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
 RETURNING id
`;

  const values = [
    name, nationalId, role, status, gender, date_of_birth, reason,
    visitedKidName || null,
    visitedKidGrade || null,
    visitedKidFamily || null,
    visitedKidMother || null,
    alumniTime || null,
    alumniMeetingPerson || null,
    visitorOrigin || null,
    visitorTitle || null,
  
    groupLead || null,
    groupNumber || null,
    groupTime || null
  ];

  pool.query(sql,values, (err, result) => {
       if (err) {
      console.error("it's error my guy", err);
  if (err.code === "23505") { 
        return res.status(400).json({ message: "This National ID is already registered" });
      }
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json({ message: "User registered successfully!", id: result.rows[0].id });
  });
});

app.post("/AddAdmin", (req, res) => {
  const { username, role, password } = req.body;

  if (!username || !role || !password) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
 
  if(role !=='admin'){
    return res.status(400).json({message: "please only admin allowed to be registered!"});
  }

  const sql = "INSERT INTO admins (username, role, password) VALUES ($1, $2, $3) RETURNING id";
  pool.query(sql, [username, role, password], (err, result) => {
    if (err) {
      console.error("Error adding admin:", err);
      if (err.code === "23505") {
        return res.status(400).json({ message: "Username already exists", error: err.message });
      }
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    res.json({
      message: "Admin added successfully!",
      admin: {
        id: result.rows[0].id,
        username,
        role
      }
    });
  });
});

// ✅ Login Route
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Username, password, and role required" });
  }

  const sql = "SELECT * FROM admins WHERE username = $1 AND password = $2 AND role = $3";

  pool.query(sql, [username, password, role], (err, results) => {
    if (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }
  
    if (results.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials or role" });
    }

    // ✅ Success
    const admin = results.rows[0];
    res.json({
      success: true,
      message: "Login successful",
      role: admin.role,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  });
});

app.post("/AddProfile/:userId", upload.single("profile_image"), async (req, res) => {
  try {
    const { email } = req.body;
    const user_id = req.params.userId;

    let imageUrl = null;
    let public_id = null; 

    if (req.file) {
   
const result = await cloudinary.uploader.upload(req.file.path, {
  folder: "profiles",
  transformation: [{ width: 600, height: 600, crop: "fill" }]
});


      imageUrl = result.secure_url;
      public_id = result.public_id;


      fs.unlinkSync(req.file.path);
    }
    else{
      console.log("no file uploaded");
    }

const sql = "INSERT INTO profiles (user_id, email, image_url, public_id) VALUES ($1, $2, $3, $4) RETURNING *";
    pool.query(sql, [user_id, email, imageUrl, public_id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ 
        message: "Profile created successfully!",
        imageUrl
      });
    });

  } catch (err) {
  console.error("AddProfile error:", err); // ✅ Log full error
  if (req.file && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkErr) {
      console.warn("Failed to delete temp file:", unlinkErr.message);
    }
  }
  res.status(500).json({ error: "Upload failed", details: err.message });
}

});



// Fetch all users
app.get("/users", (req, res) => {
  const sql = "SELECT id, name, national_id, role, status, DATE(created_at) AS date, created_at FROM users";
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results.rows);
  });
});

app.get("/users/:id", (req, res) => {
const { id } = req.params;

if (isNaN(id)) {
  return res.status(400).json({ error: "Invalid user ID" });
}
  const sql = `
    SELECT 
      id, 
      name, 
      national_id, 
      role, 
      gender, 
      date_of_birth, 
      status, 
      reason, 
      visited_kid_name, 
      visited_kid_family, 
      visited_kid_grade, 
      visited_kid_mother, 
      alumni_time, 
      alumni_meeting_person, 
      visitor_origin, 
      visitor_title, 
 
      group_lead, 
      group_number, 
      group_time,
      DATE(created_at) AS date, 
      created_at
    FROM users 
    WHERE id = $1
  `;

pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

   if (results.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results.rows[0]);
  });
});


// getting the profiles of the current logged in users
app.get("/profile/:userId", (req, res) => {
  const user_id = req.params.userId;
  
  const sql = "SELECT email, image_url FROM profiles WHERE user_id = $1";
  
  pool.query(sql, [user_id], (err, results) => {
    if (err) {
     console.error("Database error:", err);
     return res.status(500).json({ error: err.message });
   }
if (results.rows.length === 0) {
  return res.status(404).json({ error: "Profile not found" });
    }
     console.log("Fetched profiles:", results);
    res.json(results.rows[0]); 
  });
});

app.post("/Edits/:userId", upload.single("profile_image"), async (req, res) => {
  try {
    const user_id = req.params.userId;

    let imageUrl = null;
  
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
      
      
      fs.unlinkSync(req.file.path);
    }
const sql = "UPDATE profiles SET email = $1, image_url = $2 WHERE user_id = $3"; 
    pool.query(sql, [user_id, email, imageUrl], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      
      res.json({ 
        message: "Profile updated successfully!",
        imageUrl 
      });
    });

  } catch (err) {
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Upload failed" });
  }
});


//getting the profile of all profiles
app.get("/profiles", (req, res) => {
  const myId = req.query.exclude;
  const sql = "SELECT user_id, image_url FROM profiles WHERE user_id != $1";

  pool.query(sql, [myId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "database error" });
    }
    res.json(results.rows);
  });
});

//fescht messages
app.get("/messages/:senderUsername/:receiverUsername", (req, res) => {
  const { senderUsername, receiverUsername } = req.params;

  const getUserId = (username, callback) => {
    pool.query("SELECT id FROM admins WHERE username = $1", [username], (err, result) => {
      if (err || result.rows.length === 0) return callback(null);
      callback(result.rows[0].id);
    });
  };

  getUserId(senderUsername, (senderId) => {
    if (!senderId) return res.status(404).json({ error: "Sender not found" });

    getUserId(receiverUsername, (receiverId) => {
      if (!receiverId) return res.status(404).json({ error: "Receiver not found" });
      
      const sql = `
        SELECT m.*, a1.username AS senderUsername, a2.username AS receiverUsername
        FROM messages m
        JOIN admins a1 ON m.sender_id = a1.id
        JOIN admins a2 ON m.receiver_id = a2.id
        WHERE (m.sender_id = $1 AND m.receiver_id = $2)
           OR (m.sender_id = $2 AND m.receiver_id = $1)
        ORDER BY m.timestamp ASC
      `;

      // ✅ Only 2 parameters needed
      pool.query(sql, [senderId, receiverId], (err, results) => {
        if (err) {
          console.error("❌ Error fetching messages:", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(results.rows);
      });
    });
  });
});


app.put("/messages/mark-as-read/:senderId/:receiverId",(req,res)=>{
  const { senderId , receiverId } =req.params;

  const sql=  `
    UPDATE messages
   SET is_read=TRUE WHERE sender_id=$1 AND receiver_id=$2 AND is_read=FALSE
    `;
    pool.query(sql,[senderId,receiverId],(err,result)=>{
     if(err){
      return res.status(500).json({error: "database error!"})
     }
     res.json({message:"marked as read"});

    });
  });

app.get("/admins", (req, res) => {
  const excludeId = req.query.excludeId;
  let sql = "SELECT id, username, role FROM admins";
  let values = [];

  if (excludeId) {
    sql += " WHERE id != $1";
    values.push(excludeId);
  }

  pool.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching admins:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results.rows);
  });
});


// mrs lions setting
app.get("/dashboard-data", (req, res) => {
  let daysFromQuery = Number(req.query.days);
    
  if (!daysFromQuery) {
    pool.query("SELECT value FROM settings WHERE name='dataRetention'", (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      const days = results.rows && results.rows[0] ? Number(results.rows[0].value) : 30;
      
      fetchUsers(days, res);
    });
  } else {
    fetchUsers(daysFromQuery, res);
  }

  function fetchUsers(days, res) {

    const query = `SELECT * FROM users WHERE created_at >= NOW() - INTERVAL '${days} days'`;

    pool.query(query, (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(data.rows); 
    });
  }
});

// GET overstaying users// GET overstaying users
app.get("/overstay-notifications", (req, res) => {
  let limitFromQuery = Number(req.query.limit);

  const fetchOverstays = (overstayLimit) => {
    const sql = `
      SELECT id AS "userId", name, status,
             EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 AS "hoursInside"
      FROM users
      WHERE LOWER(status) = 'inside'
      AND (EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600) >= $1
    `;
    
    pool.query(sql, [overstayLimit], (err2, results) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const notifications = results.rows.map(row => ({
        userId: row.userId,
        message: `${row.name} has been inside for ${Math.round(row.hoursInside)} hours`,
        status: row.status
      }));

      res.json({ notifications, count: notifications.length });
    });
  };

  if (limitFromQuery) {
    fetchOverstays(limitFromQuery);
  } else {
    pool.query("SELECT value FROM settings WHERE name='overstayLimit' LIMIT 1", (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const overstayLimit = r.rows && r.rows[0] ? Number(r.rows[0].value) : 12;
      fetchOverstays(overstayLimit);
    });
  }
});

//the goat messi
app.put("/settings", (req, res) => {
  const { name, value } = req.body;
  pool.query("UPDATE settings SET value = $1 WHERE name = $2", [value, name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Setting updated" });
  });
});



app.put("/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Status is required" });

  // ✅ FIXED: PostgreSQL syntax
  const sql = "UPDATE users SET status = $1 WHERE id = $2";
  pool.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
  
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "Status updated successfully", id, status });
  });
});

//delete the users 
app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  
  const sql = "DELETE FROM users WHERE id = $1"; 
  
  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User deleted successfully" });
  });
});
//the goat messi the server
//app.listen(PORT, () => { in case needed
 // console.log(`🚀 Server running on http://localhost:${PORT}`);
//});

// to connect to the server
server.listen(PORT, () => {
  console.log(`🚀 Server running with Socket.IO on http://localhost:${PORT}`);
});
