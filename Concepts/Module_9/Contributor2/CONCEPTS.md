✏️ Concept - 01

🔤 Name:

Centralized Profile Picture Updates

🎯 Purpose:

To ensure that when a user changes their profile picture, the new image automatically appears everywhere that user is displayed throughout the application, including posts, comments, profile cards, and network pages.

❓ Why it was challenging:

This was challenging because a user's profile picture appeared in many different components throughout the application. At first, it seemed like updating the image in one place should be enough, but I learned that every component displaying user information must reference the same source of data. If even one component stores outdated information or doesn't re-render correctly, the user ends up seeing different profile pictures in different places. Understanding how all of those pieces connected together helped me better understand state management and data consistency across the frontend.

📍 Where (file & line):

Home.jsx, Blogs.jsx, Network.jsx, ProfileAvatar.jsx, and any components responsible for displaying user information.

✏️ Concept - 02

🔤 Name:

Like / Unlike Toggle Logic

🎯 Purpose:

To prevent users from repeatedly liking the same post and artificially increasing the like count while still allowing them to remove their like if they change their mind.

❓ Why it was challenging:

This was challenging because the logic goes beyond simply increasing a counter when a button is clicked. The application has to know which users have already liked a post and determine whether the click should add a like or remove one. I had to understand how to check for existing user IDs, update the likes array correctly, and keep the displayed count synchronized with the database. This helped me better understand conditional logic and user-specific interactions.

📍 Where (file & line):

Post components, like button handlers, and the corresponding post update endpoint used for likes.

✏️ Concept - 03

🔤 Name:

Nested Reply Depth Styling

🎯 Purpose:

To make long reply chains easier to read by visually distinguishing each level of nesting through progressively darker background colors.

❓ Why it was challenging:

This was challenging because I had to think about both functionality and user experience. Creating replies is one thing, but making deeply nested conversations easy to follow is another. I had to understand how reply depth is tracked and then apply different styling based on that depth level. The deeper a reply became, the darker the background needed to be. This taught me that building a feature isn't always enough—sometimes the real challenge is presenting the information in a way that users can easily understand.

📍 Where (file & line):

Reply rendering components, nested comment components, and the CSS or styling logic responsible for reply depth visualization.