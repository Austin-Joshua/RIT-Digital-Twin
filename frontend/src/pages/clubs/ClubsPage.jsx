import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../hooks/AuthContext";
import {
    ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell
} from "recharts";

/* ─── Canonical RIT club metadata ─────────────────────────────────────────── */
const CLUB_META = {
    "Apple Centre of Excellence": {
        icon: "🍎", color: "#6366f1",
        gradient: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
        shortTag: "Center of Excellence", tagColor: "#6366f1",
        activities: [
            "iOS & macOS app development using Swift / SwiftUI",
            "Apple Developer Program mentoring & App Store deployment",
            "WWDC student challenges and Apple scholarship preparation",
            "Research projects on Vision Pro spatial computing",
            "Hackathons focused on Apple ecosystem integration",
        ],
        purpose: "Empowers students in the complete Apple development ecosystem — from iPhone app design to advanced Vision Pro spatial experiences — under the guidance of Apple-certified mentors.",
    },
    "VR & AR Centre of Excellence": {
        icon: "🥽", color: "#0ea5e9",
        gradient: "linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%)",
        shortTag: "Center of Excellence", tagColor: "#0ea5e9",
        activities: [
            "Unity & Unreal Engine 3D environment development",
            "HoloLens 2 mixed-reality application prototyping",
            "VR therapy and educational simulation research",
            "WebXR and browser-based AR projects",
            "Immersive lab tours for prospective students",
        ],
        purpose: "A state-of-the-art immersive computing lab that trains students in XR design and development, preparing them for careers in the fast-growing spatial computing industry.",
    },
    "Cyber Security & Digital Forensics Centre": {
        icon: "🔐", color: "#ef4444",
        gradient: "linear-gradient(135deg,#ef4444 0%,#f97316 100%)",
        shortTag: "Center of Excellence", tagColor: "#ef4444",
        activities: [
            "Ethical hacking & penetration testing workshops (CEH aligned)",
            "CTF (Capture The Flag) competitions — national & international",
            "Digital forensics investigations on simulated crime datasets",
            "VAPT (Vulnerability Assessment and Penetration Testing) boot camps",
            "Cryptography and blockchain security research",
            "Bug-bounty programme guidance and OWASP training",
        ],
        purpose: "Prepares the next generation of cybersecurity professionals through hands-on offensive/defensive security training, competitive CTF participation, and industry-recognised certifications.",
    },
    "AI & Robotics Centre of Excellence": {
        icon: "🤖", color: "#22c55e",
        gradient: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
        shortTag: "Center of Excellence", tagColor: "#22c55e",
        activities: [
            "Computer vision and object detection projects (YOLO, OpenCV)",
            "Autonomous drone and ground-robot programming",
            "Deep learning model training with GPU clusters",
            "Smart India Hackathon (SIH) AI-track problem solving",
            "Collaboration with DRDO and defence-tech partners",
            "AI for social good — crop disease and healthcare diagnostics",
        ],
        purpose: "A research-first centre that bridges academic AI and real-world robotics, producing graduates capable of leading India's automation and defence-tech industries.",
    },
    "IoT & Smart Systems Centre": {
        icon: "📡", color: "#f59e0b",
        gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
        shortTag: "Center of Excellence", tagColor: "#f59e0b",
        activities: [
            "Smart campus sensor network deployments (temperature, occupancy, energy)",
            "Embedded systems and RTOS programming on STM32 / ESP32",
            "Edge AI model deployment on Raspberry Pi and Jetson Nano",
            "Industrial IoT (IIoT) protocol labs (MQTT, OPC-UA, Modbus)",
            "LoRa-based long-range sensor grid projects",
            "Product prototyping for startup incubation pitches",
        ],
        purpose: "Connects physical infrastructure to the digital world by building real sensors, gateways, and analytics pipelines that feed the RIT Digital Twin platform itself.",
    },
    "Electric Vehicle & Green Tech Centre": {
        icon: "⚡", color: "#84cc16",
        gradient: "linear-gradient(135deg,#84cc16 0%,#22c55e 100%)",
        shortTag: "Center of Excellence", tagColor: "#84cc16",
        activities: [
            "EV drivetrain design and motor controller programming",
            "Li-ion battery management system (BMS) development",
            "Solar-powered charging station prototyping",
            "Collaboration with TNEI and TANGEDCO for grid projects",
            "SAE and BAJA student vehicle competitions",
            "Carbon footprint analysis and sustainability reporting",
        ],
        purpose: "Drives RIT's green-tech ambitions by training engineers in sustainable mobility, renewable energy, and EV systems shaping the future of transportation.",
    },
    "Coding Club": {
        icon: "💻", color: "#3b82f6",
        gradient: "linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)",
        shortTag: "Technical", tagColor: "#3b82f6",
        activities: [
            "Weekly competitive programming contests (Codeforces, LeetCode)",
            "Open-source contribution sprints and GitHub project showcases",
            "DSA bootcamps for placement preparation",
            "Inter-college coding championships",
            "Peer-to-peer pair programming sessions",
        ],
        purpose: "The primary community for algorithmic thinkers at RIT — from beginners learning their first loop to national-level competitive programmers chasing ICPC glory.",
    },
    "Google Developer Student Club": {
        icon: "🌐", color: "#4285f4",
        gradient: "linear-gradient(135deg,#4285f4 0%,#34a853 100%)",
        shortTag: "Technical", tagColor: "#4285f4",
        activities: [
            "Android & Flutter app development workshops",
            "Google Cloud Skill Boost certification tracks",
            "Solution challenges and Google-mentored capstone projects",
            "Firebase, Maps API, and ML Kit integrations",
            "Google I/O Extended community viewing events",
            "Study jams and peer-learning circles for GCP certs",
        ],
        purpose: "An official Google Developer Student Club chapter that brings Google's technologies to campus — connecting students to Google engineers, resources, and a global developer network.",
    },
    "Infinitus Club": {
        icon: "∞", color: "#a855f7",
        gradient: "linear-gradient(135deg,#a855f7 0%,#6366f1 100%)",
        shortTag: "Technical", tagColor: "#a855f7",
        activities: [
            "Scopus-indexed research paper writing and publication workshops",
            "Smart India Hackathon (SIH) team formation and mentoring",
            "Patent filing awareness and IP rights guidance",
            "Innovation pitch sessions to panel of industry experts",
            "Annual 'Infinitus' intra-college innovation symposium",
        ],
        purpose: "Channels the deepest intellectual curiosity at RIT — if you want to publish papers, file patents, or win national hackathons, Infinitus is your launchpad.",
    },
    "STEAM Club": {
        icon: "🔬", color: "#06b6d4",
        gradient: "linear-gradient(135deg,#06b6d4 0%,#0ea5e9 100%)",
        shortTag: "Technical", tagColor: "#06b6d4",
        activities: [
            "Interdisciplinary project exhibitions combining art and engineering",
            "Science fair mentoring for school outreach",
            "Applied maths problem sessions and olympiad prep",
            "Guest lectures bridging STEM and humanities",
            "Collaborative design sprints with Artist League",
        ],
        purpose: "Breaks disciplinary silos by fostering innovation at the intersection of Science, Technology, Engineering, Arts, and Mathematics — creating well-rounded engineers.",
    },
    "IoT Club": {
        icon: "📲", color: "#f59e0b",
        gradient: "linear-gradient(135deg,#f59e0b 0%,#f97316 100%)",
        shortTag: "Technical", tagColor: "#f59e0b",
        activities: [
            "Hands-on sensor, actuator, and microcontroller projects",
            "Smart campus automation mini-projects",
            "Weekly hardware prototyping sessions in the maker lab",
            "Industry visits to IoT manufacturing units",
        ],
        purpose: "A hands-on maker club where every student gets to solder, program, and deploy a real hardware project within their first semester of membership.",
    },
    "CAM Club": {
        icon: "⚙️", color: "#64748b",
        gradient: "linear-gradient(135deg,#64748b 0%,#475569 100%)",
        shortTag: "Technical", tagColor: "#64748b",
        activities: [
            "SolidWorks, AutoCAD, and CATIA 3D modelling workshops",
            "CNC machining process training",
            "Design for Manufacturing (DFM) case studies",
            "Component tolerance analysis projects",
        ],
        purpose: "Sharpens mechanical design and manufacturing skills through hands-on CAD/CAM tool training and real-world machining simulations.",
    },
    "Techsparks Club": {
        icon: "✨", color: "#f97316",
        gradient: "linear-gradient(135deg,#f97316 0%,#ef4444 100%)",
        shortTag: "Technical", tagColor: "#f97316",
        activities: [
            "Annual inter-college Techsparks tech-fest organisation",
            "Student-led workshops on trending tech topics",
            "Peer mentoring and academic buddy programme",
            "Start-up ideation and MVP incubation support",
        ],
        purpose: "Student-run, student-powered — organising RIT's premier annual tech fest and fostering entrepreneurial thinking throughout the academic year.",
    },
    "Maths Club": {
        icon: "📐", color: "#6366f1",
        gradient: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
        shortTag: "Technical", tagColor: "#6366f1",
        activities: [
            "Weekly problem-solving circles (GATE, Olympiad level)",
            "Applied maths lectures covering cryptography and ML foundations",
            "Pi Day and other maths awareness events",
            "MATLAB and Python for numerical computation workshops",
        ],
        purpose: "Rekindles the love for mathematics by showing how abstract concepts power real-world technology — from neural networks to RSA encryption.",
    },
    "Vaarithi Muthamizh Mandram": {
        icon: "📜", color: "#dc2626",
        gradient: "linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)",
        shortTag: "Cultural — Tamil", tagColor: "#dc2626",
        activities: [
            "Pattimandram (formal Tamil debate) competitions — college and zonal level",
            "Tamil elocution and kavithai (poetry) recitation events",
            "Celebration of Thai Pongal, Tamil New Year, and Kaveri Pushkaram",
            "Tamil literary workshops and kural (Thirukkural) study circles",
            "Annual Tamil magazine 'Muthamizh' publication",
        ],
        purpose: "Preserves and promotes the rich Dravidian literary heritage of Tamil Nadu, nurturing eloquence, cultural pride, and regional identity among students.",
    },
    "Artist League": {
        icon: "🎨", color: "#ec4899",
        gradient: "linear-gradient(135deg,#ec4899 0%,#a855f7 100%)",
        shortTag: "Cultural — Arts", tagColor: "#ec4899",
        activities: [
            "Digital illustration and graphic design training (Illustrator, Photoshop)",
            "Annual 'Canvas' fine-arts exhibition and competition",
            "Visual branding for all campus events and clubs",
            "Poster design competitions for social causes",
            "Sketch, watercolour, and acrylic painting workshops",
        ],
        purpose: "The creative backbone of RIT — every poster, banner, and visual campaign is crafted here, and artists are given a platform to express, exhibit, and grow.",
    },
    "Podcast (POD) Club": {
        icon: "🎙️", color: "#8b5cf6",
        gradient: "linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%)",
        shortTag: "Cultural — Media", tagColor: "#8b5cf6",
        activities: [
            "Weekly campus podcast episode production (RIT FM)",
            "Interview sessions with alumni, faculty, and industry guests",
            "Audio engineering — recording, mixing, and mastering workshops",
            "YouTube & Spotify channel management",
            "Short-form video and reel production for social media",
        ],
        purpose: "Gives students a voice — teaching broadcast media, storytelling, and content creation skills demanded by the modern media industry.",
    },
    "Mediastic Hub": {
        icon: "📰", color: "#0ea5e9",
        gradient: "linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%)",
        shortTag: "Cultural — Media", tagColor: "#0ea5e9",
        activities: [
            "Campus journalism — RIT digital newsletter and news portal",
            "Live event social media coverage (Instagram, LinkedIn)",
            "Video editing and production for official RIT communications",
            "Institutional PR for conferences and MOUs",
            "Photojournalism training and press accreditation workshops",
        ],
        purpose: "The official media wing of RIT — operating as a live newsroom covering campus life, institutional milestones, and student achievements.",
    },
    "Telugu Club": {
        icon: "🌸", color: "#f59e0b",
        gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
        shortTag: "Cultural — Regional", tagColor: "#f59e0b",
        activities: [
            "Telugu literary meets and poetry recitation events",
            "Ugadi and Sankranti cultural celebrations",
            "Public speaking and oratory competitions in Telugu",
            "Regional cuisine and heritage awareness workshops",
        ],
        purpose: "Celebrates the Telugu language and culture on campus, creating a home-away-from-home for Telugu-speaking students and promoting regional diversity.",
    },
    "Photography Club": {
        icon: "📷", color: "#334155",
        gradient: "linear-gradient(135deg,#334155 0%,#1e293b 100%)",
        shortTag: "Cultural — Arts", tagColor: "#334155",
        activities: [
            "On-campus photo walks and composition workshops",
            "Event photography for all RIT functions",
            "Photo editing masterclasses (Lightroom, Photoshop)",
            "Annual 'Frame It' photography contest with cash prizes",
            "Drone aerial photography certification sessions",
        ],
        purpose: "Frames the story of RIT — from convocation to lab experiments — through the lens of talented student photographers who document institutional memory.",
    },
    "Nippon Club": {
        icon: "🇯🇵", color: "#ef4444",
        gradient: "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)",
        shortTag: "Language — Japanese", tagColor: "#ef4444",
        activities: [
            "JLPT N5 and N4 structured preparation classes",
            "Japanese conversational practice sessions with native tutors",
            "Japan cultural workshops — Origami, Ikebana, Anime culture",
            "Corporate Japanese communication for MNC placements",
            "Annual 'Nihon Matsuri' Japan cultural festival",
        ],
        purpose: "Prepares students for careers in Japanese multinational companies by combining language proficiency training with deep cultural immersion, significantly improving placement prospects.",
    },
    "Language Club": {
        icon: "🗣️", color: "#10b981",
        gradient: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
        shortTag: "Language", tagColor: "#10b981",
        activities: [
            "Public speaking and presentation skills training",
            "Debate competitions — British Parliamentary format",
            "English proficiency bootcamps for GRE/IELTS preparation",
            "Multilingual communication and translation exercises",
            "Group discussions and mock interview panels",
        ],
        purpose: "Develops confident, articulate communicators who can express complex ideas clearly in any professional or academic context.",
    },
    "Unnat Bharat Abhiyan (UBA)": {
        icon: "🌾", color: "#16a34a",
        gradient: "linear-gradient(135deg,#16a34a 0%,#15803d 100%)",
        shortTag: "Service — Rural Dev", tagColor: "#16a34a",
        activities: [
            "Adoption and development of 5 nearby villages (Govt. mandate)",
            "Rural sanitation, clean water, and solid waste management projects",
            "Solar lamp and renewable energy deployment in adopted villages",
            "Digital literacy camps for school children and farmers",
            "Soil testing, crop advisory, and agri-tech awareness drives",
        ],
        purpose: "Fulfils RIT's national service obligation under the Government of India's Unnat Bharat Abhiyan scheme — applying engineering knowledge to uplift rural communities.",
    },
    "National Service Scheme (NSS)": {
        icon: "🤝", color: "#2563eb",
        gradient: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",
        shortTag: "Service — NSS", tagColor: "#2563eb",
        activities: [
            "Annual 7-day overnight rural service camp",
            "Blood donation drives (bi-annual, 200+ units collected)",
            "Republic Day and Independence Day parades and cultural programmes",
            "Street cleaning and tree-plantation drives in Chennai",
            "Voter registration awareness and civic responsibility campaigns",
            "COVID-19 and natural disaster relief volunteering",
        ],
        purpose: "India's largest student volunteer movement — at RIT, NSS builds empathy, leadership, and social responsibility while making measurable community impact.",
    },
    "Youth Red Cross (YRC)": {
        icon: "🏥", color: "#dc2626",
        gradient: "linear-gradient(135deg,#dc2626 0%,#b91c1c 100%)",
        shortTag: "Service — Health", tagColor: "#dc2626",
        activities: [
            "First Aid Level-1 and Level-2 certification training",
            "Voluntary blood donor registry maintenance (350+ active donors)",
            "Disaster preparedness and emergency response drills",
            "Health awareness rallies — cancer, diabetes, hypertension screening",
            "Eye donation and organ donation pledge camps",
            "Deaddiction and mental health awareness workshops",
        ],
        purpose: "Trains students to be life-savers through first aid certification, blood donation drives, and health awareness aligned with the International Red Cross movement.",
    },
    "Rotaract Club": {
        icon: "🔄", color: "#1d4ed8",
        gradient: "linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%)",
        shortTag: "Service — Rotary", tagColor: "#1d4ed8",
        activities: [
            "Community service projects under Rotary International guidance",
            "Leadership development retreats and inter-club conferences",
            "School adoption — stationary and scholarship distribution",
            "Environmental awareness campaigns (coastal cleanup)",
            "Vocational skills training for underprivileged youth",
        ],
        purpose: "A globally affiliated Rotary youth chapter that develops professional ethics, leadership, and service orientation through structured community programmes.",
    },
    "YUVA Club": {
        icon: "🌟", color: "#f59e0b",
        gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
        shortTag: "Service — Leadership", tagColor: "#f59e0b",
        activities: [
            "Youth leadership summits and motivational speaker series",
            "Civic engagement — Swachh Bharat, voter literacy",
            "Personality development and soft-skills workshops",
            "Inter-college youth parliament simulations",
            "Mental health peer support circle",
        ],
        purpose: "Unleashes the full potential of RIT students by building leadership character, civic consciousness, and holistic development beyond textbooks.",
    },
    "Women Empowerment Club": {
        icon: "💪", color: "#ec4899",
        gradient: "linear-gradient(135deg,#ec4899 0%,#be185d 100%)",
        shortTag: "Service — Empowerment", tagColor: "#ec4899",
        activities: [
            "International Women's Day symposia and panel discussions",
            "Self-defence and personal safety awareness training",
            "Menstrual health and hygiene awareness campaigns",
            "Girls in STEM mentoring and scholarship guidance",
            "Legal rights awareness — POSH, anti-ragging, harassment redressal",
            "Financial literacy and entrepreneurship workshops for women",
        ],
        purpose: "Champions gender equity on campus and beyond — empowering every woman at RIT with knowledge, skills, confidence, and a strong support network.",
    },
};

const CATEGORY_LABELS = {
    center_of_excellence: "Center of Excellence",
    technical: "Technical",
    cultural: "Cultural",
    language: "Language",
    service: "Service",
    general: "General",
};

const CATEGORY_COLORS = {
    center_of_excellence: "#a855f7",
    technical: "#3b82f6",
    cultural: "#ec4899",
    language: "#10b981",
    service: "#16a34a",
    general: "#64748b",
};

const PIE_COLORS = ["#6366f1","#0ea5e9","#22c55e","#f59e0b","#ef4444","#ec4899","#a855f7"];

function getMeta(clubName) {
    return CLUB_META[clubName] || { icon:"🏛️",color:"#64748b",gradient:"linear-gradient(135deg,#64748b 0%,#475569 100%)",shortTag:"Club",tagColor:"#64748b",activities:[],purpose:"" };
}

/* ─── ClubDetailModal ─────────────────────────────────────────────────────── */
function ClubDetailModal({ club, onClose, myMembership, onJoin, saving, canManageMembers, canManageClubs, pendingMembers, onApprove, facultyOptions, onAssignCoordinator, onToggleStatus }) {
    const meta = getMeta(club.clubName);
    const catLabel = CATEGORY_LABELS[club.category] || club.category;
    return (
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
            <div style={{background:"var(--theme-surface)",borderRadius:20,maxWidth:720,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.4)",border:"1px solid var(--theme-border)"}} onClick={e=>e.stopPropagation()}>
                <div style={{background:meta.gradient,borderRadius:"20px 20px 0 0",padding:"32px 28px 24px",position:"relative"}}>
                    <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    <div style={{fontSize:56,marginBottom:12}}>{meta.icon}</div>
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <h2 style={{color:"#fff",margin:0,fontSize:"1.5rem"}}>{club.clubName}</h2>
                        <span style={{background:"rgba(255,255,255,0.25)",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700}}>{catLabel}</span>
                        <span style={{background:club.status==="active"?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)",color:"#fff",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700}}>{club.status}</span>
                    </div>
                    <div style={{color:"rgba(255,255,255,0.85)",marginTop:8,fontSize:14}}>
                        {club.memberCount} active member{club.memberCount!==1?"s":""}
                        {club.facultyCoordinator&&club.facultyCoordinator!=="Not Assigned"?` · Coordinated by ${club.facultyCoordinator}`:""}
                    </div>
                </div>
                <div style={{padding:"24px 28px",display:"grid",gap:20}}>
                    {/* Purpose */}
                    <div>
                        <div style={{fontWeight:800,fontSize:13,textTransform:"uppercase",letterSpacing:".06em",color:"var(--theme-text-muted)",marginBottom:8}}>About</div>
                        <p style={{margin:0,lineHeight:1.7,color:"var(--theme-text)",fontSize:15}}>{meta.purpose||club.description}</p>
                        {meta.purpose&&club.description&&meta.purpose!==club.description&&(
                            <p style={{margin:"8px 0 0",lineHeight:1.6,color:"var(--theme-text-muted)",fontSize:13}}>{club.description}</p>
                        )}
                    </div>
                    {/* Activities */}
                    {meta.activities.length>0&&(
                        <div>
                            <div style={{fontWeight:800,fontSize:13,textTransform:"uppercase",letterSpacing:".06em",color:"var(--theme-text-muted)",marginBottom:12}}>Key Activities</div>
                            <div style={{display:"grid",gap:8}}>
                                {meta.activities.map((act,i)=>(
                                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",background:"var(--theme-bg)",borderRadius:10,border:"1px solid var(--theme-border)",borderLeft:`3px solid ${meta.color}`}}>
                                        <span style={{color:meta.color,fontWeight:700,minWidth:20}}>{i+1}.</span>
                                        <span style={{fontSize:14,color:"var(--theme-text)"}}>{act}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Info row */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
                        {[{label:"Category",value:catLabel},{label:"Contact",value:club.contactEmail||"—"},{label:"Coordinator",value:club.facultyCoordinator||"Not Assigned"},{label:"Active Members",value:club.memberCount}].map(({label,value})=>(
                            <div key={label} style={{background:"var(--theme-bg)",borderRadius:10,padding:"12px 14px",border:"1px solid var(--theme-border)"}}>
                                <div style={{fontSize:11,color:"var(--theme-text-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>{label}</div>
                                <div style={{fontWeight:700,fontSize:14,wordBreak:"break-word"}}>{value}</div>
                            </div>
                        ))}
                    </div>
                    {/* Student join status */}
                    {myMembership!==undefined&&(
                        <div>
                            <div style={{fontWeight:800,fontSize:13,textTransform:"uppercase",letterSpacing:".06em",color:"var(--theme-text-muted)",marginBottom:10}}>Your Membership</div>
                            {myMembership?(
                                <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:myMembership.status==="active"?"rgba(34,197,94,0.08)":"rgba(245,158,11,0.08)",border:`1px solid ${myMembership.status==="active"?"#22c55e":"#f59e0b"}`,borderRadius:12}}>
                                    <span style={{fontSize:28}}>{myMembership.status==="active"?"✅":"⏳"}</span>
                                    <div>
                                        <div style={{fontWeight:700}}>{myMembership.status==="active"?"Active Member":"Pending Approval"}</div>
                                        <div style={{fontSize:13,color:"var(--theme-text-muted)"}}>Role: <strong>{myMembership.roleType}</strong> · Joined: {myMembership.joinedDate}</div>
                                        {myMembership.status==="pending"&&<div style={{fontSize:12,color:"#f59e0b",marginTop:4}}>⚡ Your join request is awaiting Faculty / HOD / Admin approval.</div>}
                                    </div>
                                </div>
                            ):(
                                <button onClick={()=>{onJoin(club.clubId);onClose();}} disabled={saving} style={{background:meta.gradient,color:"#fff",border:"none",borderRadius:10,padding:"12px 24px",fontWeight:700,fontSize:15,cursor:"pointer",opacity:saving?0.6:1}}>
                                    🚀 Request to Join {club.clubName}
                                </button>
                            )}
                        </div>
                    )}
                    {/* Pending approvals */}
                    {canManageMembers&&pendingMembers.length>0&&(
                        <div>
                            <div style={{fontWeight:800,fontSize:13,textTransform:"uppercase",letterSpacing:".06em",color:"#f59e0b",marginBottom:10}}>⏳ Pending Join Requests ({pendingMembers.length})</div>
                            <div style={{display:"grid",gap:8}}>
                                {pendingMembers.map(m=>(
                                    <div key={m.membershipId} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(245,158,11,0.07)",border:"1px solid #f59e0b",borderRadius:10,flexWrap:"wrap"}}>
                                        <div style={{flex:1,minWidth:120}}>
                                            <div style={{fontWeight:700}}>{m.studentName}</div>
                                            <div style={{fontSize:12,color:"var(--theme-text-muted)"}}>ID: {m.studentId} · {m.department||"—"}</div>
                                        </div>
                                        <div style={{fontSize:12,color:"var(--theme-text-muted)"}}>Requested: {m.joinedDate}</div>
                                        <button onClick={()=>onApprove(m.membershipId)} disabled={saving} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>✓ Approve</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Admin controls */}
                    {canManageClubs&&(
                        <div style={{borderTop:"1px solid var(--theme-border)",paddingTop:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                            <div style={{fontWeight:700,color:"var(--theme-text-muted)",fontSize:13}}>Admin Controls:</div>
                            <button onClick={()=>onToggleStatus(club)} style={{background:club.status==="active"?"rgba(239,68,68,0.1)":"rgba(34,197,94,0.1)",color:club.status==="active"?"#ef4444":"#22c55e",border:`1px solid ${club.status==="active"?"#ef4444":"#22c55e"}`,borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>
                                {club.status==="active"?"⏸ Deactivate":"▶ Activate"}
                            </button>
                            <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200}}>
                                <span style={{fontSize:13,color:"var(--theme-text-muted)"}}>Coordinator:</span>
                                <select defaultValue={club.facultyCoordinatorId||""} onChange={e=>onAssignCoordinator(club.clubId,Number(e.target.value))} style={{flex:1,borderRadius:8,padding:"8px",fontSize:13}}>
                                    <option value="">Not Assigned</option>
                                    {facultyOptions.map(f=><option key={f.id} value={f.id}>{f.name}{f.department?` (${f.department})`:""}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── ClubCard ────────────────────────────────────────────────────────────── */
function ClubCard({ club, myMembership, onJoin, saving, role, onClick }) {
    const meta = getMeta(club.clubName);
    const catLabel = CATEGORY_LABELS[club.category]||club.category;
    let badge = null;
    if (myMembership) {
        if (myMembership.status==="active") badge=<span style={{background:"#22c55e",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>✓ Member</span>;
        else if (myMembership.status==="pending") badge=<span style={{background:"#f59e0b",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>⏳ Pending</span>;
    }
    const fullText = meta.purpose||club.description||"";
    const shortDesc = fullText.slice(0,110)+(fullText.length>110?"…":"");
    return (
        <div onClick={onClick} style={{background:"var(--theme-surface)",borderRadius:16,overflow:"hidden",border:"1px solid var(--theme-border)",cursor:"pointer",transition:"transform 160ms ease,box-shadow 160ms ease",display:"flex",flexDirection:"column"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 40px ${meta.color}33`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <div style={{background:meta.gradient,padding:"20px 20px 14px",display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{fontSize:36,lineHeight:1}}>{meta.icon}</div>
                <div style={{flex:1}}>
                    <div style={{fontWeight:800,color:"#fff",fontSize:15,lineHeight:1.3}}>{club.clubName}</div>
                    <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{background:"rgba(255,255,255,0.25)",color:"#fff",padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>{catLabel}</span>
                        <span style={{background:club.status==="active"?"rgba(34,197,94,0.35)":"rgba(239,68,68,0.35)",color:"#fff",padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>{club.status}</span>
                        {badge}
                    </div>
                </div>
            </div>
            <div style={{padding:"14px 18px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
                <p style={{margin:0,fontSize:13,color:"var(--theme-text-muted)",lineHeight:1.6}}>{shortDesc}</p>
                <div style={{display:"flex",gap:16,fontSize:12,color:"var(--theme-text-muted)"}}>
                    <span>👥 <strong style={{color:"var(--theme-text)"}}>{club.memberCount}</strong> members</span>
                    {club.facultyCoordinator&&club.facultyCoordinator!=="Not Assigned"&&<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>🎓 {club.facultyCoordinator}</span>}
                </div>
                {meta.activities.length>0&&(
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {meta.activities.slice(0,2).map((act,i)=>(
                            <span key={i} style={{background:`${meta.color}15`,color:meta.color,borderRadius:8,padding:"3px 8px",fontSize:11,fontWeight:600}}>
                                {act.split(/[,–-]/)[0].trim().slice(0,30)}
                            </span>
                        ))}
                        {meta.activities.length>2&&<span style={{color:"var(--theme-text-muted)",fontSize:11,padding:"3px 6px"}}>+{meta.activities.length-2} more</span>}
                    </div>
                )}
                <div style={{marginTop:"auto",display:"flex",gap:8,paddingTop:8}}>
                    <button onClick={e=>{e.stopPropagation();onClick();}} style={{flex:1,background:"var(--theme-bg)",border:`1px solid ${meta.color}`,color:meta.color,borderRadius:8,padding:"8px",fontWeight:700,fontSize:13,cursor:"pointer"}}>View Details</button>
                    {role==="STUDENT"&&!myMembership&&(
                        <button onClick={e=>{e.stopPropagation();onJoin(club.clubId);}} disabled={saving} style={{flex:1,background:meta.gradient,color:"#fff",border:"none",borderRadius:8,padding:"8px",fontWeight:700,fontSize:13,cursor:"pointer",opacity:saving?0.6:1}}>Join Request</button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main ClubsPage ─────────────────────────────────────────────────────── */
const ClubsPage = () => {
    const { user } = useAuth();
    const role = (user?.role || "").replace("ROLE_","").toUpperCase();

    const [clubs, setClubs] = useState([]);
    const [myMemberships, setMyMemberships] = useState([]);
    const [studentRef, setStudentRef] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [facultyOptions, setFacultyOptions] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedClubId, setSelectedClubId] = useState("");
    const [clubMembers, setClubMembers] = useState([]);
    const [memberFilters, setMemberFilters] = useState({query:"",status:"all"});
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [memberEdits, setMemberEdits] = useState({});
    const [newMembership, setNewMembership] = useState({studentIdNumber:"",roleType:"member",joinedDate:new Date().toISOString().slice(0,10),status:"active"});
    const [_loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [newClub, setNewClub] = useState({clubName:"",description:"",category:"technical",contactEmail:"",status:"active"});
    const [activeTab, setActiveTab] = useState("directory");

    const canManageClubs = role==="ADMIN";
    const canManageMembers = role==="ADMIN"||role==="FACULTY"||role==="HOD";
    const canViewAnalytics = role==="ADMIN"||role==="HOD";

    const showSuccess = msg=>{ setSuccessMsg(msg); setTimeout(()=>setSuccessMsg(""),3500); };

    const loadData = useCallback(async()=>{
        try {
            setLoading(true); setError("");
            const [clubsRes,studentRes,studentRefRes,analyticsRes,facultyRes] = await Promise.all([
                api.get("/clubs"),
                role==="STUDENT"?api.get("/clubs/student/me/involvement"):Promise.resolve({data:[]}),
                role==="STUDENT"?api.get("/clubs/student/me"):Promise.resolve({data:null}),
                canViewAnalytics?api.get("/clubs/analytics"):Promise.resolve({data:null}),
                (canManageClubs||canViewAnalytics)?api.get("/clubs/faculty-options"):Promise.resolve({data:[]}),
            ]);
            const clubsData = clubsRes?.data||[];
            setClubs(clubsData);
            setFacultyOptions(facultyRes?.data||[]);
            if(role==="STUDENT"){setMyMemberships(studentRes?.data||[]);setStudentRef(studentRefRes?.data||null);}
            if(canViewAnalytics) setAnalytics(analyticsRes?.data||null);
            if(clubsData.length>0&&!selectedClubId) setSelectedClubId(String(clubsData[0].clubId));
        } catch { setError("Unable to load clubs right now. Please try again."); }
        finally { setLoading(false); }
    },[canManageClubs,canViewAnalytics,role,selectedClubId]);

    useEffect(()=>{ loadData(); },[loadData]);

    useEffect(()=>{
        const load = async()=>{
            if(!canManageMembers||!selectedClubId) return;
            try {
                const res = await api.get(`/clubs/${selectedClubId}/members`);
                const members = Array.isArray(res.data)?res.data:[];
                setClubMembers(members);
                const editState={};
                members.forEach(m=>{ editState[m.membershipId]={roleType:m.roleType,status:m.status}; });
                setMemberEdits(editState);
            } catch { setClubMembers([]); }
        };
        load();
    },[selectedClubId,canManageMembers]);

    const myMembershipByClubId = useMemo(()=>{ const map=new Map(); myMemberships.forEach(m=>map.set(m.clubId,m)); return map; },[myMemberships]);

    const filteredClubs = useMemo(()=>{
        let list=clubs;
        if(categoryFilter!=="all"){
            if(categoryFilter==="clubs") list=list.filter(c=>c.category!=="center_of_excellence");
            else list=list.filter(c=>c.category===categoryFilter);
        }
        if(searchQuery.trim()){ const q=searchQuery.toLowerCase(); list=list.filter(c=>c.clubName.toLowerCase().includes(q)||(c.description||"").toLowerCase().includes(q)||(c.category||"").toLowerCase().includes(q)); }
        return list;
    },[clubs,categoryFilter,searchQuery]);

    const filteredMembers = useMemo(()=>{
        const q=memberFilters.query.trim().toLowerCase();
        return clubMembers.filter(m=>{
            const mq=!q||[m.studentName,m.studentId,m.roleType,m.department].some(v=>String(v||"").toLowerCase().includes(q));
            const ms=memberFilters.status==="all"||String(m.status||"").toLowerCase()===memberFilters.status;
            return mq&&ms;
        });
    },[clubMembers,memberFilters]);

    const pendingMembersForModal = useMemo(()=>{ if(!selectedClub) return []; return clubMembers.filter(m=>m.status==="pending"&&m.clubId===selectedClub.clubId); },[clubMembers,selectedClub]);

    const departmentChartData = useMemo(()=>(analytics?.participationByDepartment||[]).map(item=>({name:item.department||"NA",count:Number(item.count||0)})),[analytics]);
    const yearChartData = useMemo(()=>(analytics?.participationByYear||[]).map(item=>({year:String(item.year??"0"),count:Number(item.count||0)})),[analytics]);

    const handleCreateClub=async e=>{ e.preventDefault(); try{setSaving(true);await api.post("/clubs",newClub);setNewClub({clubName:"",description:"",category:"technical",contactEmail:"",status:"active"});await loadData();showSuccess("Club created successfully!");}catch{setError("Could not create club.");}finally{setSaving(false);} };
    const toggleClubStatus=async club=>{ try{await api.patch(`/clubs/${club.clubId}/status`,{status:club.status==="active"?"inactive":"active"});await loadData();}catch{setError("Status update failed.");} };
    const assignCoordinator=async(clubId,fid)=>{ try{setSaving(true);await api.patch(`/clubs/${clubId}/coordinator`,{facultyUserId:fid});await loadData();}catch{setError("Coordinator assignment failed.");}finally{setSaving(false);} };
    const requestJoin=async clubId=>{
        if(role!=="STUDENT") return;
        try{setSaving(true);const sid=studentRef?.studentId;if(!sid){setError("Membership request unavailable until your student profile is linked.");return;}await api.post("/clubs/memberships/request",{studentId:sid,clubId,roleType:"member",status:"pending"});await loadData();showSuccess("Join request submitted! Awaiting Faculty/HOD approval.");}catch{setError("Unable to submit join request.");}finally{setSaving(false);}
    };
    const approveMembership=async mid=>{ try{setSaving(true);await api.put(`/clubs/memberships/${mid}`,{status:"active"});const res=await api.get(`/clubs/${selectedClubId}/members`);setClubMembers(Array.isArray(res.data)?res.data:[]);await loadData();showSuccess("Membership approved!");}catch{setError("Could not approve membership.");}finally{setSaving(false);} };
    const setMemberEditField=(mid,key,value)=>setMemberEdits(prev=>({...prev,[mid]:{...(prev[mid]||{}),[key]:value}}));
    const saveMemberInline=async mid=>{ const edit=memberEdits[mid];if(!edit) return; try{setSaving(true);await api.put(`/clubs/memberships/${mid}`,{roleType:edit.roleType,status:edit.status});const res=await api.get(`/clubs/${selectedClubId}/members`);setClubMembers(Array.isArray(res.data)?res.data:[]);await loadData();showSuccess("Updated!");}catch{setError("Membership update failed.");}finally{setSaving(false);} };
    const deactivateMember=async mid=>{ try{setSaving(true);await api.delete(`/clubs/memberships/${mid}`);const res=await api.get(`/clubs/${selectedClubId}/members`);setClubMembers(Array.isArray(res.data)?res.data:[]);await loadData();}catch{setError("Could not deactivate membership.");}finally{setSaving(false);} };
    const exportCSV=async()=>{ if(!selectedClubId) return; try{const res=await api.get(`/clubs/${selectedClubId}/export`,{responseType:"text"});const blob=new Blob([res.data],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`club-${selectedClubId}-members.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}catch{setError("CSV export failed.");} };
    const createMembership=async e=>{ e.preventDefault();if(!selectedClubId){setError("Select a club.");return;}if(!newMembership.studentIdNumber.trim()){setError("Student ID required.");return;} try{setSaving(true);setError("");await api.post("/clubs/memberships",{clubId:Number(selectedClubId),studentIdNumber:newMembership.studentIdNumber.trim(),roleType:newMembership.roleType,joinedDate:newMembership.joinedDate,status:newMembership.status});setNewMembership(p=>({...p,studentIdNumber:"",roleType:"member",status:"active"}));const res=await api.get(`/clubs/${selectedClubId}/members`);setClubMembers(Array.isArray(res.data)?res.data:[]);await loadData();showSuccess("Member added!");}catch{setError("Could not add membership.");}finally{setSaving(false);} };

    const tabs=[{id:"directory",label:"🏛️ Club Directory",show:true},{id:"mymemberships",label:"🪪 My Clubs",show:role==="STUDENT"},{id:"members",label:"👥 Manage Members",show:canManageMembers},{id:"analytics",label:"📊 Analytics",show:canViewAnalytics}].filter(t=>t.show);
    const pendingGlobal=myMemberships.filter(m=>m.status==="pending").length;

    return (
        <div className="stu-dashboard" style={{display:"grid",gap:20}}>
            {/* Header */}
            <div className="stu-info-card" style={{borderTopColor:"var(--theme-brand-strong)"}}>
                <div className="info-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                    <div>
                        <span style={{fontSize:"1.2rem",fontWeight:800}}>🏛️ Campus Organizations & Clubs</span>
                        <div style={{fontSize:13,color:"var(--theme-text-muted)",fontWeight:400,marginTop:2}}>{clubs.length} organizations · {clubs.filter(c=>c.status==="active").length} active</div>
                    </div>
                    {role==="STUDENT"&&pendingGlobal>0&&<span style={{background:"#f59e0b",color:"#fff",borderRadius:20,padding:"4px 12px",fontSize:13,fontWeight:700}}>⏳ {pendingGlobal} pending request{pendingGlobal!==1?"s":""}</span>}
                </div>
                {error&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(239,68,68,0.08)",border:"1px solid #ef4444",borderRadius:8,color:"#ef4444",fontSize:13}}>⚠️ {error}<button onClick={()=>setError("")} style={{marginLeft:10,background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontWeight:700}}>✕</button></div>}
                {successMsg&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(34,197,94,0.08)",border:"1px solid #22c55e",borderRadius:8,color:"#22c55e",fontSize:13}}>✅ {successMsg}</div>}
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {tabs.map(tab=>(
                    <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{padding:"10px 18px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",border:activeTab===tab.id?"2px solid var(--theme-brand-strong)":"2px solid var(--theme-border)",background:activeTab===tab.id?"var(--theme-brand-strong)":"var(--theme-surface)",color:activeTab===tab.id?"#fff":"var(--theme-text)",transition:"all 160ms ease"}}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Directory Tab ─────────────────────────────────────────────── */}
            {activeTab==="directory"&&(
                <>
                    {canManageClubs&&(
                        <div className="stu-info-card" style={{borderTopColor:"#7c3aed"}}>
                            <div className="info-header">➕ Register New Organization</div>
                            <div className="info-body">
                                <form onSubmit={handleCreateClub} style={{display:"grid",gap:12}}>
                                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
                                        <input value={newClub.clubName} onChange={e=>setNewClub({...newClub,clubName:e.target.value})} placeholder="Organization Name *" required/>
                                        <input value={newClub.contactEmail} onChange={e=>setNewClub({...newClub,contactEmail:e.target.value})} placeholder="Contact Email" type="email"/>
                                        <select value={newClub.category} onChange={e=>setNewClub({...newClub,category:e.target.value})}>
                                            <option value="technical">Technical Club</option>
                                            <option value="center_of_excellence">Center of Excellence</option>
                                            <option value="language">Language Club</option>
                                            <option value="service">Service Club</option>
                                            <option value="cultural">Cultural Club</option>
                                        </select>
                                        <select value={newClub.status} onChange={e=>setNewClub({...newClub,status:e.target.value})}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <textarea value={newClub.description} onChange={e=>setNewClub({...newClub,description:e.target.value})} placeholder="Description *" rows={2} required style={{resize:"vertical",borderRadius:8,padding:10}}/>
                                    <button className="table-btn primary" disabled={saving} type="submit" style={{justifySelf:"start",padding:"10px 20px"}}>Create Organization</button>
                                </form>
                            </div>
                        </div>
                    )}
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
                        <input placeholder="🔍 Search clubs by name, description, category…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{flex:1,minWidth:200,borderRadius:10,padding:"10px 14px",border:"1px solid var(--theme-border)"}}/>
                        {[{id:"all",label:`All (${clubs.length})`},{id:"center_of_excellence",label:`⭐ CoE (${clubs.filter(c=>c.category==="center_of_excellence").length})`},{id:"technical",label:`💻 Technical (${clubs.filter(c=>c.category==="technical").length})`},{id:"cultural",label:`🎭 Cultural (${clubs.filter(c=>c.category==="cultural").length})`},{id:"service",label:`🤝 Service (${clubs.filter(c=>c.category==="service").length})`},{id:"language",label:`🗣️ Language (${clubs.filter(c=>c.category==="language").length})`}].map(f=>(
                            <button key={f.id} onClick={()=>setCategoryFilter(f.id)} style={{padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",border:categoryFilter===f.id?`2px solid ${CATEGORY_COLORS[f.id]||"var(--theme-brand-strong)"}`:"2px solid var(--theme-border)",background:categoryFilter===f.id?`${CATEGORY_COLORS[f.id]||"var(--theme-brand-strong)"}18`:"var(--theme-surface)",color:categoryFilter===f.id?(CATEGORY_COLORS[f.id]||"var(--theme-brand-strong)"):"var(--theme-text)",transition:"all 140ms ease"}}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    {filteredClubs.length===0
                        ?<div style={{textAlign:"center",padding:"40px",color:"var(--theme-text-muted)",fontSize:15}}>No clubs found matching your search.</div>
                        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
                            {filteredClubs.map(club=>(
                                <ClubCard key={club.clubId} club={club} myMembership={myMembershipByClubId.get(club.clubId)} onJoin={requestJoin} saving={saving} role={role}
                                    onClick={()=>{setSelectedClub(club);setSelectedClubId(String(club.clubId));}}/>
                            ))}
                        </div>
                    }
                </>
            )}

            {/* ── My Clubs Tab ──────────────────────────────────────────────── */}
            {activeTab==="mymemberships"&&role==="STUDENT"&&(
                <div className="stu-info-card" style={{borderTopColor:"#ec4899"}}>
                    <div className="info-header">🪪 My Club Involvement</div>
                    <div className="info-body">
                        {myMemberships.length===0
                            ?<div style={{textAlign:"center",padding:"32px",color:"var(--theme-text-muted)"}}><div style={{fontSize:40,marginBottom:12}}>🏛️</div><div style={{fontWeight:700,marginBottom:6}}>You have not joined any club yet</div><div style={{fontSize:13}}>Browse the Club Directory and click &quot;Join Request&quot;.</div></div>
                            :<div style={{display:"grid",gap:14}}>
                                {myMemberships.map(m=>{
                                    const meta=getMeta(m.clubName);
                                    return(
                                        <div key={m.membershipId} style={{border:"1px solid var(--theme-border)",borderLeft:`4px solid ${meta.color}`,borderRadius:12,overflow:"hidden",background:"var(--theme-bg)"}}>
                                            <div style={{background:meta.gradient,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                                                <span style={{fontSize:28}}>{meta.icon}</span>
                                                <div style={{flex:1}}><div style={{fontWeight:800,color:"#fff",fontSize:15}}>{m.clubName}</div><div style={{color:"rgba(255,255,255,0.8)",fontSize:12}}>{m.clubDescription}</div></div>
                                                <span style={{background:m.status==="active"?"rgba(34,197,94,0.3)":"rgba(245,158,11,0.3)",color:"#fff",padding:"4px 12px",borderRadius:20,fontWeight:700,fontSize:12}}>{m.status==="active"?"✅ Active":"⏳ Pending"}</span>
                                            </div>
                                            <div style={{padding:"14px 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
                                                {[{label:"Your Role",value:m.roleType},{label:"Joined",value:m.joinedDate},{label:"Coordinator",value:m.facultyCoordinator||"Not Assigned"},{label:"Status",value:m.status==="active"?"Active Member":"Awaiting Approval"}].map(({label,value})=>(
                                                    <div key={label}><div style={{fontSize:11,color:"var(--theme-text-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</div><div style={{fontWeight:700,fontSize:14,marginTop:2}}>{value}</div></div>
                                                ))}
                                            </div>
                                            {m.status==="pending"&&<div style={{margin:"0 18px 14px",padding:"10px 14px",background:"rgba(245,158,11,0.08)",border:"1px solid #f59e0b",borderRadius:8,fontSize:13,color:"#d97706"}}>⚡ Your join request for <strong>{m.clubName}</strong> is pending approval from the Faculty Coordinator or HOD.</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                    </div>
                </div>
            )}

            {/* ── Manage Members Tab ──────────────────────────────────────── */}
            {activeTab==="members"&&canManageMembers&&(
                <div className="stu-info-card">
                    <div className="info-header">👥 Membership Management</div>
                    <div className="info-body" style={{display:"grid",gap:16}}>
                        {clubMembers.filter(m=>m.status==="pending").length>0&&(
                            <div style={{padding:"14px 18px",background:"rgba(245,158,11,0.08)",border:"2px solid #f59e0b",borderRadius:12}}>
                                <div style={{fontWeight:700,color:"#d97706",marginBottom:10}}>⏳ {clubMembers.filter(m=>m.status==="pending").length} Pending Join Request(s) — Action Required</div>
                                <div style={{display:"grid",gap:8}}>
                                    {clubMembers.filter(m=>m.status==="pending").map(m=>(
                                        <div key={m.membershipId} style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",padding:"10px 14px",background:"var(--theme-bg)",borderRadius:8,border:"1px solid var(--theme-border)"}}>
                                            <div style={{flex:1}}><div style={{fontWeight:700}}>{m.studentName}</div><div style={{fontSize:12,color:"var(--theme-text-muted)"}}>ID: {m.studentId} · {m.department||"—"} · Club: {m.clubName}</div></div>
                                            <div style={{fontSize:12,color:"var(--theme-text-muted)"}}>Requested: {m.joinedDate}</div>
                                            <button onClick={()=>approveMembership(m.membershipId)} disabled={saving} style={{background:"#22c55e",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>✓ Approve</button>
                                            <button onClick={()=>deactivateMember(m.membershipId)} disabled={saving} style={{background:"rgba(239,68,68,0.08)",color:"#ef4444",border:"1px solid #ef4444",borderRadius:8,padding:"8px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>✕ Reject</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <form onSubmit={createMembership} style={{display:"grid",gap:10}}>
                            <div style={{fontWeight:700,fontSize:14}}>➕ Add New Member</div>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
                                <select value={selectedClubId} onChange={e=>setSelectedClubId(e.target.value)} required><option value="">Select Club *</option>{clubs.map(c=><option key={c.clubId} value={c.clubId}>{c.clubName}</option>)}</select>
                                <input placeholder="Student ID Number *" value={newMembership.studentIdNumber} onChange={e=>setNewMembership(p=>({...p,studentIdNumber:e.target.value}))} required/>
                                <input placeholder="Role (member / core_member / president…)" value={newMembership.roleType} onChange={e=>setNewMembership(p=>({...p,roleType:e.target.value}))} required/>
                                <input type="date" value={newMembership.joinedDate} onChange={e=>setNewMembership(p=>({...p,joinedDate:e.target.value}))} required/>
                                <select value={newMembership.status} onChange={e=>setNewMembership(p=>({...p,status:e.target.value}))}><option value="active">Active</option><option value="inactive">Inactive</option></select>
                                <button className="table-btn primary" disabled={saving||!selectedClubId} type="submit">Add Member</button>
                            </div>
                        </form>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
                            <select value={selectedClubId} onChange={e=>setSelectedClubId(e.target.value)}><option value="">Select Club to View</option>{clubs.map(c=><option key={c.clubId} value={c.clubId}>{c.clubName}</option>)}</select>
                            <input placeholder="Search student / role / dept" value={memberFilters.query} onChange={e=>setMemberFilters(p=>({...p,query:e.target.value}))}/>
                            <select value={memberFilters.status} onChange={e=>setMemberFilters(p=>({...p,status:e.target.value}))}><option value="all">All Statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select>
                            <button className="table-btn" onClick={exportCSV}>📥 Export CSV</button>
                        </div>
                        <div className="stu-data-table-wrapper">
                            <table className="stu-data-table">
                                <thead><tr><th>Student</th><th>Department</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {filteredMembers.map(m=>(
                                        <tr key={m.membershipId}>
                                            <td><div style={{fontWeight:700}}>{m.studentName}</div><div style={{fontSize:11,color:"var(--theme-text-muted)"}}>ID: {m.studentId}</div></td>
                                            <td>{m.department||"-"}</td>
                                            <td><input value={memberEdits[m.membershipId]?.roleType||""} onChange={e=>setMemberEditField(m.membershipId,"roleType",e.target.value)} style={{width:130,borderRadius:6,padding:"4px 8px",fontSize:13}}/></td>
                                            <td><select value={memberEdits[m.membershipId]?.status||"active"} onChange={e=>setMemberEditField(m.membershipId,"status",e.target.value)} style={{fontSize:13,borderRadius:6,padding:"4px 8px"}}><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select></td>
                                            <td>{m.joinedDate}</td>
                                            <td style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                                {m.status==="pending"&&<button className="table-btn primary" disabled={saving} onClick={()=>approveMembership(m.membershipId)}>Approve</button>}
                                                <button className="table-btn" disabled={saving} onClick={()=>saveMemberInline(m.membershipId)}>Save</button>
                                                <button className="table-btn" disabled={saving} onClick={()=>deactivateMember(m.membershipId)} style={{color:"#ef4444"}}>Deactivate</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredMembers.length===0&&<tr><td colSpan={6} style={{textAlign:"center",color:"var(--theme-text-muted)",padding:"24px"}}>{selectedClubId?"No memberships match the current filter.":"Select a club above to view its members."}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Analytics Tab ─────────────────────────────────────────────── */}
            {activeTab==="analytics"&&canViewAnalytics&&analytics&&(
                <div className="stu-info-card" style={{borderTopColor:"#16a34a"}}>
                    <div className="info-header">📊 Club Participation Analytics</div>
                    <div className="info-body" style={{display:"grid",gap:20}}>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
                            {[{label:"Active Clubs",value:analytics.activeClubs,color:"#22c55e"},{label:"Inactive Clubs",value:analytics.inactiveClubs,color:"#64748b"},{label:"Active Memberships",value:analytics.activeMemberships,color:"#3b82f6"},{label:"Engagement Rate",value:`${analytics.studentEngagementRate}%`,color:"#f59e0b"}].map(({label,value,color})=>(
                                <div key={label} style={{background:`${color}12`,border:`1px solid ${color}40`,borderRadius:12,padding:"16px 18px",textAlign:"center"}}>
                                    <div style={{fontSize:24,fontWeight:800,color}}>{value}</div>
                                    <div style={{fontSize:12,color:"var(--theme-text-muted)",marginTop:4}}>{label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
                            <div style={{height:260,border:"1px solid var(--theme-border)",borderRadius:12,padding:14}}>
                                <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>Participation by Department</div>
                                <ResponsiveContainer width="100%" height="85%"><BarChart data={departmentChartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis allowDecimals={false} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="count" fill="#2563eb" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
                            </div>
                            <div style={{height:260,border:"1px solid var(--theme-border)",borderRadius:12,padding:14}}>
                                <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>Participation by Year</div>
                                <ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={yearChartData} dataKey="count" nameKey="year" outerRadius={85} label>{yearChartData.map((_,i)=><Cell key={`y-${i}`} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer>
                            </div>
                        </div>
                        {analytics.coreMembers&&analytics.coreMembers.length>0&&(
                            <div>
                                <div style={{fontWeight:700,marginBottom:12}}>🏆 Core Leadership Members</div>
                                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                                    {analytics.coreMembers.map(m=>{ const meta=getMeta(m.clubName); return(
                                        <div key={m.membershipId} style={{display:"flex",gap:10,alignItems:"center",padding:"10px 14px",border:`1px solid ${meta.color}40`,borderLeft:`3px solid ${meta.color}`,borderRadius:10,background:"var(--theme-bg)"}}>
                                            <span style={{fontSize:22}}>{meta.icon}</span>
                                            <div><div style={{fontWeight:700,fontSize:13}}>{m.studentName}</div><div style={{fontSize:11,color:"var(--theme-text-muted)"}}>{m.roleType} · {m.clubName}</div></div>
                                        </div>
                                    );})}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Club Detail Modal */}
            {selectedClub&&(
                <ClubDetailModal club={selectedClub} onClose={()=>setSelectedClub(null)}
                    myMembership={role==="STUDENT"?myMembershipByClubId.get(selectedClub.clubId):undefined}
                    onJoin={requestJoin} saving={saving}
                    canManageMembers={canManageMembers} canManageClubs={canManageClubs}
                    pendingMembers={pendingMembersForModal}
                    onApprove={approveMembership}
                    facultyOptions={facultyOptions}
                    onAssignCoordinator={assignCoordinator}
                    onToggleStatus={toggleClubStatus}
                />
            )}
        </div>
    );
};

export default ClubsPage;
