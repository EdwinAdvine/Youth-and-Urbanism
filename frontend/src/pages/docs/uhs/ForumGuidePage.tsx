// ForumGuidePage - Comprehensive guide for the community forum on UHS.
// Covers browsing posts, creating posts, categories, replying, bookmarking,
// moderation, community guidelines, and tips for good posts.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsImagePlaceholder from '../../../components/docs/DocsImagePlaceholder';

const ForumGuidePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Forum Guide
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Connect with the UHS community, ask questions, share knowledge, and learn together.
      </p>

      {/* Table of Contents */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">On this page</h3>
        <nav className="grid sm:grid-cols-2 gap-1">
          {[
            { id: 'browsing', label: 'Browsing Posts' },
            { id: 'creating', label: 'Creating a Post' },
            { id: 'categories', label: 'Forum Categories' },
            { id: 'replying', label: 'Replying to Posts' },
            { id: 'bookmarking', label: 'Liking & Bookmarking' },
            { id: 'moderation', label: 'Reporting & Moderation' },
            { id: 'guidelines', label: 'Community Guidelines' },
            { id: 'tips', label: 'Tips for Good Posts' },
          ].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-red-600 dark:text-red-400 hover:underline py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Browsing Posts */}
      <DocsSection
        id="browsing"
        title="Browsing Posts"
        description="Explore discussions by latest, popular, or unanswered."
      >
        <p className="mb-4">
          The community forum is accessible from the "Forum" section in your sidebar. It is a
          space where students, instructors, and parents come together to discuss topics related
          to education, courses, and the UHS platform.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Browsing options:</h4>
        <div className="space-y-3 mb-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Latest</h4>
              <p className="text-sm">View the most recent posts sorted by creation date. New posts appear at the top. This is the default view.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Popular</h4>
              <p className="text-sm">Posts with the most likes, replies, and views. A great way to find high-quality discussions and well-answered questions.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-400 text-sm font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Unanswered</h4>
              <p className="text-sm">Posts that have not received any replies yet. Help the community by answering unanswered questions.</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Search and filter:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Use the search bar to find posts by keyword, title, or author</li>
            <li>Filter by category (see the categories section below)</li>
            <li>Filter by grade level to see discussions relevant to your level</li>
            <li>Filter by tag to find specific topic areas</li>
          </ul>
        </div>
        <DocsImagePlaceholder
          description="Forum homepage showing latest posts, category filters, and search bar"
          path="/docs/screenshots/forum-browse.png"
        />
      </DocsSection>

      {/* Creating a Post */}
      <DocsSection
        id="creating"
        title="Creating a Post"
        description="Share a question, idea, or resource with the community."
      >
        <p className="mb-4">
          Creating a forum post is the best way to get help from the community or share something
          valuable. Every UHS user with a verified account can create posts.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to create a post:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Click the "New Post" button at the top of the forum page</li>
          <li>Enter a clear, descriptive title that summarizes your question or topic</li>
          <li>Select the appropriate category (e.g., Subject Help, Study Tips, General)</li>
          <li>Write the body of your post using the rich text editor (supports formatting, images, code blocks, and links)</li>
          <li>Add relevant tags to help others find your post (e.g., "math," "grade-7," "algebra")</li>
          <li>Preview your post to ensure formatting looks correct</li>
          <li>Click "Publish" to make your post visible to the community</li>
        </ol>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Rich Text Editor</h4>
            <p className="text-sm">Format your post with bold, italic, headings, lists, code blocks, and embedded images to make it easy to read.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Tags</h4>
            <p className="text-sm">Add up to 5 tags per post. Tags improve discoverability and help users with similar questions find your post.</p>
          </div>
        </div>
        <DocsImagePlaceholder
          description="New post editor with title, category selector, rich text editor, and tags"
          path="/docs/screenshots/forum-create-post.png"
        />
      </DocsSection>

      {/* Forum Categories */}
      <DocsSection
        id="categories"
        title="Forum Categories"
        description="Posts are organized into categories for easy navigation."
      >
        <p className="mb-4">
          Every forum post belongs to a category. Choosing the right category ensures your post
          reaches the people most likely to help or be interested.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Category</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Description</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-4 py-2 font-medium">General</td>
                <td className="px-4 py-2">General discussions about UHS and education</td>
                <td className="px-4 py-2">Platform feedback, introductions, off-topic</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Subject Help</td>
                <td className="px-4 py-2">Questions about specific subjects and topics</td>
                <td className="px-4 py-2">Math problems, science questions, language help</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Study Tips</td>
                <td className="px-4 py-2">Study strategies, time management, and learning advice</td>
                <td className="px-4 py-2">Exam preparation, study schedules, productivity</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">CBC Curriculum</td>
                <td className="px-4 py-2">Discussions specific to the Kenyan CBC framework</td>
                <td className="px-4 py-2">Competency questions, curriculum guidance, grade transitions</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Course Reviews</td>
                <td className="px-4 py-2">Reviews and recommendations for UHS courses</td>
                <td className="px-4 py-2">Course comparisons, instructor feedback, recommendations</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Tech & Platform</td>
                <td className="px-4 py-2">Technical questions about using the UHS platform</td>
                <td className="px-4 py-2">Feature questions, bug reports, how-to guides</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Parent Corner</td>
                <td className="px-4 py-2">Discussions for parents about supporting their children</td>
                <td className="px-4 py-2">Parenting advice, monitoring tips, subscription questions</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Instructor Lounge</td>
                <td className="px-4 py-2">Instructor-only discussions about teaching on UHS</td>
                <td className="px-4 py-2">Course creation, teaching strategies, earnings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* Replying to Posts */}
      <DocsSection
        id="replying"
        title="Replying to Posts"
        description="Join the conversation by responding to other users' posts."
      >
        <p className="mb-4">
          Replying to posts is how conversations happen on the forum. Your replies help other
          students learn and build a knowledge base for the entire community.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to reply:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Open the post you want to reply to</li>
          <li>Scroll to the reply box at the bottom of the post</li>
          <li>Write your reply using the rich text editor</li>
          <li>You can quote specific parts of the original post or other replies</li>
          <li>Click "Post Reply" to submit your response</li>
        </ol>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Reply features:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>@Mentions:</strong> Tag other users by typing @ followed by their username</li>
            <li><strong>Quoting:</strong> Select text from another reply and click "Quote" to reference it</li>
            <li><strong>Code Blocks:</strong> Share code snippets with syntax highlighting</li>
            <li><strong>Mark as Solution:</strong> If you asked the original question, you can mark a reply as the accepted solution</li>
          </ul>
        </div>
      </DocsSection>

      {/* Liking & Bookmarking */}
      <DocsSection
        id="bookmarking"
        title="Liking & Bookmarking"
        description="Show appreciation and save posts for later."
      >
        <p className="mb-4">
          Liking and bookmarking are quick ways to engage with forum content. Likes help surface
          the best content, while bookmarks let you save posts for future reference.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Liking a Post</h4>
            <p className="text-sm">Click the heart icon on any post or reply to show appreciation. Posts with many likes appear in the "Popular" tab. You can unlike by clicking again.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Bookmarking a Post</h4>
            <p className="text-sm">Click the bookmark icon to save a post to your "Saved Posts" collection. Access your bookmarks from the "Bookmarks" tab in the forum sidebar.</p>
          </div>
        </div>
      </DocsSection>

      {/* Reporting & Moderation */}
      <DocsSection
        id="moderation"
        title="Reporting & Moderation"
        description="Help keep the community safe by reporting inappropriate content."
      >
        <p className="mb-4">
          UHS has a dedicated moderation team that ensures the forum remains a safe, respectful,
          and productive space. If you encounter content that violates community guidelines, you
          can report it for review.
        </p>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How to report a post:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm mb-4">
          <li>Click the three-dot menu on the post or reply you want to report</li>
          <li>Select "Report" from the dropdown menu</li>
          <li>Choose a reason: spam, harassment, inappropriate content, misinformation, or other</li>
          <li>Add optional details to explain your concern</li>
          <li>Submit the report -- the moderation team reviews it within 24 hours</li>
        </ol>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Moderation actions:</h4>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            <li><strong>Warning:</strong> The user receives a private warning about the violation</li>
            <li><strong>Content Removal:</strong> The offending post or reply is removed</li>
            <li><strong>Temporary Ban:</strong> The user is temporarily restricted from posting (24 hours to 30 days)</li>
            <li><strong>Permanent Ban:</strong> Repeated or severe violations result in permanent forum access removal</li>
          </ul>
        </div>
      </DocsSection>

      {/* Community Guidelines */}
      <DocsSection
        id="guidelines"
        title="Community Guidelines"
        description="Rules and expectations for participating in the UHS forum."
      >
        <p className="mb-4">
          The UHS forum is a learning community. All participants are expected to follow these
          guidelines to maintain a positive and productive environment.
        </p>
        <div className="space-y-3 mb-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">Be Respectful</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              Treat all community members with kindness and respect, regardless of age, grade level,
              or background. Disagreements are fine -- personal attacks are not.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Stay On Topic</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Post in the appropriate category and keep discussions relevant to education, learning,
              and the UHS platform. Off-topic posts should go in the "General" category.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">No Academic Dishonesty</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Do not share exam answers, post copyrighted course content, or help others cheat on
              assessments. The forum is for learning, not shortcuts.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Protect Privacy</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Never share personal information (phone numbers, addresses, passwords) in forum posts.
              Do not post photos of other students without their consent.
            </p>
          </div>
        </div>
      </DocsSection>

      {/* Tips for Good Posts */}
      <DocsSection
        id="tips"
        title="Tips for Good Posts"
        description="Write posts that get helpful responses from the community."
      >
        <p className="mb-4">
          The quality of your post directly affects the quality of responses you receive. Follow
          these tips to write effective forum posts.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Write a clear title:</strong> Summarize your question in the title. "Help with fractions" is vague. "How do I add fractions with different denominators (Grade 5 Math)?" is specific and searchable.</li>
            <li><strong>Provide context:</strong> Include your grade level, the course or topic, and what you have already tried. This helps others give targeted answers.</li>
            <li><strong>Use formatting:</strong> Break up long posts with headings, bullet points, and paragraphs. Well-formatted posts are easier to read and more likely to get replies.</li>
            <li><strong>Include images if helpful:</strong> If your question involves a diagram, graph, or screenshot, include an image to make your question clearer.</li>
            <li><strong>Choose the right category:</strong> Posting in the correct category ensures your question reaches the right audience.</li>
            <li><strong>Check for duplicates:</strong> Search the forum before posting to see if your question has already been answered.</li>
            <li><strong>Follow up:</strong> If someone answers your question, reply with a thank you. If the answer solves your problem, mark it as the solution.</li>
            <li><strong>Help others:</strong> When you see a question you can answer, share your knowledge. Teaching others reinforces your own understanding.</li>
          </ul>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link to="/docs/payments" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Payments
        </Link>
        <Link to="/docs/store" className="text-sm text-red-600 dark:text-red-400 hover:underline">
          Store
        </Link>
      </div>
    </div>
  );
};

export default ForumGuidePage;
