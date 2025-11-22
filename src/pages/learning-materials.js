// Color theme reference (do not remove):
// Primary: #071952, Secondary: #088395, Accent: #37B7C3, Surface: #EBF4F6

export const COURSES = [
  {
    id: "ui-ux",
    title: "UI/UX Design",
    description: "User interface and experience design",
    modules: [
      {
        id: 1,
        title: "Design Principles",
        content: "Core principles of UI/UX design.",
        materials: [
          {
            type: "blog",
            label: "Principles of Design",
            url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
          },
          { type: "video", label: "Design Basics Crash Course", url: "https://www.youtube.com/watch?v=_2LLXnUdUIc" },
          { type: "external", label: "FreeCodeCamp - Design", url: "https://www.freecodecamp.org/news/tag/ui-design/" },
        ],
        quiz: [
          {
            question: "What does UX stand for?",
            options: ["User Experience", "Uniform eXchange", "Universal eXample", "User eXecution"],
            answer: "User Experience",
          },
          {
            question: "Which is a usability heuristic?",
            options: ["A/B Testing", "Consistency and standards", "SVG", "HTTP"],
            answer: "Consistency and standards",
          },
        ],
      },
      {
        id: 2,
        title: "Wireframing",
        content: "Creating low-fidelity representations of interfaces.",
        materials: [
          { type: "blog", label: "Wireframing 101", url: "https://uxdesign.cc/wireframing-101-5da3bdd3c1c7" },
          { type: "video", label: "Wireframe in Figma", url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8" },
          { type: "external", label: "Figma", url: "https://www.figma.com/" },
        ],
        quiz: [
          {
            question: "A wireframe is best described as:",
            options: ["Blueprint", "Production UI", "A/B Test", "Backend API"],
            answer: "Blueprint",
          },
        ],
      },
      {
        id: 3,
        title: "Prototyping",
        content: "Building interactive prototypes for testing.",
        materials: [
          {
            type: "blog",
            label: "Prototyping Basics",
            url: "https://www.interaction-design.org/literature/topics/prototyping",
          },
          { type: "video", label: "Clickable Prototypes", url: "https://www.youtube.com/watch?v=1u0BUyGxG7I" },
          { type: "external", label: "InVision", url: "https://www.invisionapp.com/" },
        ],
        quiz: [
          {
            question: "A prototype is primarily:",
            options: ["Interactive Model", "Database", "CI/CD pipeline", "Design Token"],
            answer: "Interactive Model",
          },
        ],
      },
      {
        id: 4,
        title: "User Testing",
        content: "Conducting usability sessions and collecting feedback.",
        materials: [
          {
            type: "blog",
            label: "Conducting Usability Tests",
            url: "https://www.usability.gov/how-to-and-tools/methods/usability-testing.html",
          },
          { type: "video", label: "User Testing Basics", url: "https://www.youtube.com/watch?v=QckIzHC99Xc" },
          { type: "external", label: "NN/g", url: "https://www.nngroup.com/" },
        ],
        quiz: [
          {
            question: "User testing aims to collect:",
            options: ["User Feedback", "Server Logs", "Source Maps", "Unit Test Coverage"],
            answer: "User Feedback",
          },
        ],
      },
      {
        id: 5,
        title: "Design Systems",
        content: "Creating reusable design components and tokens.",
        materials: [
          {
            type: "blog",
            label: "Design Systems Handbook",
            url: "https://www.designbetter.co/design-systems-handbook",
          },
          { type: "video", label: "Design Systems Overview", url: "https://www.youtube.com/watch?v=p4rlW1z4h6k" },
          { type: "external", label: "Material Design", url: "https://m3.material.io/" },
        ],
        quiz: [
          {
            question: "A design system is a collection of:",
            options: ["Reusable Components", "Serverless Functions", "Database Tables", "Docker Images"],
            answer: "Reusable Components",
          },
        ],
      },
    ],
  },
  {
    id: "web-dev",
    title: "Web Development",
    description: "Frontend and backend web technologies",
    modules: [
      {
        id: 1,
        title: "HTML & CSS Basics",
        content: "Learn semantic HTML and modern CSS.",
        materials: [
          { type: "blog", label: "MDN HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { type: "video", label: "HTML/CSS Crash Course", url: "https://www.youtube.com/watch?v=UB1O30fR-EE" },
          {
            type: "external",
            label: "FreeCodeCamp - Responsive Web Design",
            url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
          },
        ],
        quiz: [
          {
            question: "HTML is primarily a:",
            options: ["Markup Language", "Programming Language", "Database", "Framework"],
            answer: "Markup Language",
          },
        ],
      },
      {
        id: 2,
        title: "JavaScript Fundamentals",
        content: "Syntax, data types, and DOM manipulation.",
        materials: [
          { type: "blog", label: "JavaScript.info", url: "https://javascript.info/" },
          { type: "video", label: "JS in 1 Hour", url: "https://www.youtube.com/watch?v=W6NZfCO5SIk" },
          { type: "external", label: "Eloquent JavaScript", url: "https://eloquentjavascript.net/" },
        ],
        quiz: [
          {
            question: "A closure in JS is related to:",
            options: ["Function", "Class", "Array", "Server"],
            answer: "Function",
          },
        ],
      },
      {
        id: 3,
        title: "Responsive Design",
        content: "Media queries and fluid layouts.",
        materials: [
          { type: "blog", label: "CSS-Tricks Responsive Design", url: "https://css-tricks.com/responsive-design/" },
          { type: "video", label: "Responsive Web Tutorial", url: "https://www.youtube.com/watch?v=srvUrASNj0s" },
          {
            type: "external",
            label: "MDN - Media Queries",
            url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media",
          },
        ],
        quiz: [
          {
            question: "Media queries are a:",
            options: ["CSS Rule", "JS Library", "HTTP Header", "HTML Element"],
            answer: "CSS Rule",
          },
        ],
      },
      {
        id: 4,
        title: "React Basics",
        content: "Components, props, and hooks.",
        materials: [
          { type: "blog", label: "React Docs", url: "https://react.dev/" },
          { type: "video", label: "React Crash Course", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8" },
          { type: "external", label: "FreeCodeCamp - React", url: "https://www.freecodecamp.org/news/tag/react/" },
        ],
        quiz: [
          {
            question: "JSX stands for:",
            options: ["JavaScript XML", "JSON eXtended", "Java Source eXtent", "JIT Syntax eX"],
            answer: "JavaScript XML",
          },
        ],
      },
      {
        id: 5,
        title: "Backend with Node.js",
        content: "Intro to Node and Express APIs.",
        materials: [
          { type: "blog", label: "Node.js Docs", url: "https://nodejs.org/en/docs/" },
          { type: "video", label: "Node.js Crash Course", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4" },
          { type: "external", label: "Express Guide", url: "https://expressjs.com/en/starter/basic-routing.html" },
        ],
        quiz: [
          {
            question: "Node.js is a:",
            options: ["Runtime", "Framework", "Language", "DB"],
            answer: "Runtime",
          },
        ],
      },
    ],
  },
  {
    id: "devops",
    title: "DevOps",
    description: "Deployment, CI/CD, and cloud platforms",
    modules: [
      {
        id: 1,
        title: "Intro to DevOps",
        content: "Culture and collaboration.",
        materials: [
          { type: "blog", label: "AWS DevOps", url: "https://aws.amazon.com/devops/" },
          { type: "video", label: "What is DevOps?", url: "https://www.youtube.com/watch?v=0yWAtQ6wYNM" },
          { type: "external", label: "Azure DevOps", url: "https://azure.microsoft.com/en-us/products/devops" },
        ],
        quiz: [
          {
            question: "DevOps is primarily a:",
            options: ["Culture", "Database", "Protocol", "Language"],
            answer: "Culture",
          },
        ],
      },
      {
        id: 2,
        title: "CI/CD Pipelines",
        content: "Automate build and deploy.",
        materials: [
          { type: "blog", label: "Jenkins CI", url: "https://www.jenkins.io/doc/" },
          { type: "video", label: "CI/CD Explained", url: "https://www.youtube.com/watch?v=scEDHsr3APg" },
          { type: "external", label: "GitHub Actions", url: "https://docs.github.com/actions" },
        ],
        quiz: [
          {
            question: "CI stands for:",
            options: ["Continuous Integration", "Code Inspection", "Config Injection", "Cloud Init"],
            answer: "Continuous Integration",
          },
        ],
      },
      {
        id: 3,
        title: "Containerization",
        content: "Docker and container basics.",
        materials: [
          { type: "blog", label: "Docker Overview", url: "https://docs.docker.com/get-started/overview/" },
          { type: "video", label: "Docker in 100 Seconds", url: "https://www.youtube.com/watch?v=Gjnup-PuquQ" },
          { type: "external", label: "Docker Hub", url: "https://hub.docker.com/" },
        ],
        quiz: [
          {
            question: "Docker is a:",
            options: ["Container Platform", "Hypervisor", "DB", "Linter"],
            answer: "Container Platform",
          },
        ],
      },
      {
        id: 4,
        title: "Cloud Platforms",
        content: "AWS, Azure, and GCP basics.",
        materials: [
          { type: "blog", label: "AWS Overview", url: "https://aws.amazon.com/what-is-aws/" },
          { type: "video", label: "Cloud Computing Basics", url: "https://www.youtube.com/watch?v=mxT233EdY5c" },
          { type: "external", label: "Google Cloud", url: "https://cloud.google.com/" },
        ],
        quiz: [
          {
            question: "AWS is a:",
            options: ["Cloud Platform", "Language", "Protocol", "Router"],
            answer: "Cloud Platform",
          },
        ],
      },
      {
        id: 5,
        title: "Monitoring",
        content: "Observability and alerting.",
        materials: [
          { type: "blog", label: "Prometheus", url: "https://prometheus.io/docs/introduction/overview/" },
          { type: "video", label: "Monitoring 101", url: "https://www.youtube.com/watch?v=6x0J4gZ9xjI" },
          { type: "external", label: "Grafana", url: "https://grafana.com/" },
        ],
        quiz: [
          {
            question: "Prometheus is a:",
            options: ["Monitoring Tool", "DBMS", "OS", "Queue"],
            answer: "Monitoring Tool",
          },
        ],
      },
    ],
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Fundamental data structures and algorithms",
    modules: [
      {
        id: 1,
        title: "Arrays & Strings",
        content: "Indexing and manipulation.",
        materials: [
          { type: "blog", label: "Arrays & Strings", url: "https://leetcode.com/explore/learn/card/array-and-string" },
          { type: "video", label: "Arrays in JS", url: "https://www.youtube.com/watch?v=5vP0-g94ZJ0" },
          {
            type: "external",
            label: "MDN Arrays",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
          },
        ],
        quiz: [
          {
            question: "An array is a:",
            options: ["Data Structure", "Process", "Protocol", "Parser"],
            answer: "Data Structure",
          },
        ],
      },
      {
        id: 2,
        title: "Linked Lists",
        content: "Nodes and pointers.",
        materials: [
          {
            type: "blog",
            label: "Linked List Basics",
            url: "https://www.geeksforgeeks.org/data-structures/linked-list/",
          },
          { type: "video", label: "Linked Lists", url: "https://www.youtube.com/watch?v=njTh_OwMljA" },
          { type: "external", label: "Visualizations", url: "https://visualgo.net/en/list" },
        ],
        quiz: [
          {
            question: "A linked list is a:",
            options: ["Data Structure", "Web App", "Daemon", "CLI"],
            answer: "Data Structure",
          },
        ],
      },
      {
        id: 3,
        title: "Stacks & Queues",
        content: "LIFO vs FIFO.",
        materials: [
          { type: "blog", label: "Stack DS", url: "https://www.geeksforgeeks.org/stack-data-structure/" },
          { type: "video", label: "Stacks/Queues", url: "https://www.youtube.com/watch?v=wjI1WNcIntg" },
          { type: "external", label: "Queue DS", url: "https://www.geeksforgeeks.org/queue-data-structure/" },
        ],
        quiz: [
          {
            question: "A stack follows:",
            options: ["LIFO", "FIFO", "Round Robin", "Priority"],
            answer: "LIFO",
          },
        ],
      },
      {
        id: 4,
        title: "Trees",
        content: "Binary trees and traversals.",
        materials: [
          { type: "blog", label: "Binary Trees", url: "https://www.geeksforgeeks.org/binary-tree-data-structure/" },
          { type: "video", label: "Trees Explained", url: "https://www.youtube.com/watch?v=fAAZixBzIAI" },
          {
            type: "external",
            label: "Tree Traversals",
            url: "https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/",
          },
        ],
        quiz: [
          {
            question: "A binary tree node has max:",
            options: ["Two Children", "Three Children", "One Child", "Four Children"],
            answer: "Two Children",
          },
        ],
      },
      {
        id: 5,
        title: "Graphs",
        content: "Traversal and basic algorithms.",
        materials: [
          {
            type: "blog",
            label: "Graph DS",
            url: "https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/",
          },
          { type: "video", label: "Graphs in 100s", url: "https://www.youtube.com/watch?v=tWVWeAqZ0WU" },
          { type: "external", label: "Graph Traversals", url: "https://cp-algorithms.com/graph/" },
        ],
        quiz: [
          {
            question: "A graph is a collection of nodes and:",
            options: ["Edges", "Arrays", "Stacks", "Heaps"],
            answer: "Edges",
          },
        ],
      },
    ],
  },
]

export const THEME = {
  primary: "#071952",
  secondary: "#088395",
  accent: "#37B7C3",
  surface: "#EBF4F6",
}
