INSERT INTO clubs (club_name, description, category, contact_email, status)
VALUES
    ('Apple Centre of Excellence', 'Advanced iOS application engineering, Swift/SwiftUI development, and Apple ecosystem research.', 'center_of_excellence', 'applecenter@ritchennai.edu.in', 'active'),
    ('VR & AR Centre of Excellence', 'Virtual Reality, Augmented Reality, 3D spatial computing, and immersive simulation labs.', 'center_of_excellence', 'vrcenter@ritchennai.edu.in', 'active'),
    ('Cyber Security & Digital Forensics Centre', 'Network defense, ethical hacking, cryptography, vulnerability assessment, and digital forensics research.', 'center_of_excellence', 'cybersecurity@ritchennai.edu.in', 'active'),
    ('AI & Robotics Centre of Excellence', 'Artificial intelligence, computer vision, autonomous robotics, and machine learning solutions.', 'center_of_excellence', 'airobotics@ritchennai.edu.in', 'active'),
    ('IoT & Smart Systems Centre', 'Internet of Things, embedded hardware design, smart sensor networks, and edge computing.', 'center_of_excellence', 'iotcenter@ritchennai.edu.in', 'active'),
    ('Electric Vehicle & Green Tech Centre', 'EV powertrain engineering, battery management systems, and sustainable green technology research.', 'center_of_excellence', 'evcenter@ritchennai.edu.in', 'active'),
    ('Coding Club', 'Competitive programming, algorithm design, and open-source software development.', 'technical', 'codingclub@ritchennai.edu.in', 'active'),
    ('Google Developer Student Club', 'Peer learning, hackathons, and building solutions with Google developer tools.', 'technical', 'gdsc@ritchennai.edu.in', 'active')
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    category = VALUES(category),
    contact_email = VALUES(contact_email),
    status = VALUES(status);
