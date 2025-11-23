const sequelize = require('../config/database');
const { User, Course, CourseModule, Card, CourseContent } = require('../models');

async function createDemoCourses() {
  try {
    console.log('🚀 Starting demo course creation...');

    // Initialize database (sync all models)
    console.log('📦 Syncing database models...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database synced successfully');

    // Find or create a demo admin user to own these courses
    let adminUser = await User.findOne({ where: { username: 'demo' } });

    if (!adminUser) {
      // User model automatically hashes password
      adminUser = await User.create({
        username: 'demo',
        email: 'demo@flashmind.com',
        password: 'demo123',
        fullName: 'Demo Admin',
        role: 'admin'
      });
      console.log('✅ Created demo admin user');
    }

    // Delete existing demo courses to avoid duplicates
    await Course.destroy({
      where: {
        title: [
          'Spanish for Beginners',
          'Python Programming Fundamentals',
          'Introduction to Psychology',
          'World Geography',
          'Basic Chemistry Concepts',
          'Digital Marketing Essentials'
        ]
      }
    });
    console.log('🧹 Cleaned up existing demo courses');

    // ============================================
    // 1. SPANISH FOR BEGINNERS
    // ============================================
    const spanishCourse = await Course.create({
      title: 'Spanish for Beginners',
      description: 'Learn essential Spanish vocabulary and phrases for everyday conversations. Perfect for travelers and language enthusiasts starting their Spanish journey.',
      icon: '🇪🇸',
      color: '#EF4444',
      category: 'Language',
      difficulty: 'beginner',
      language: 'English',
      isFree: true,
      isPublished: true,
      isFeatured: true,
      createdBy: adminUser.id,
      totalCards: 0,
      activeCards: 0
    });

    // Modules for Spanish course
    const spanishModule1 = await CourseModule.create({
      courseId: spanishCourse.id,
      title: 'Greetings and Introductions',
      description: 'Learn how to greet people and introduce yourself in Spanish',
      orderIndex: 1,
      icon: '👋',
      estimatedDuration: 30
    });

    const spanishModule2 = await CourseModule.create({
      courseId: spanishCourse.id,
      title: 'Numbers and Colors',
      description: 'Master basic numbers and colors in Spanish',
      orderIndex: 2,
      icon: '🔢',
      estimatedDuration: 25
    });

    const spanishModule3 = await CourseModule.create({
      courseId: spanishCourse.id,
      title: 'Common Phrases',
      description: 'Essential phrases for daily conversations',
      orderIndex: 3,
      icon: '💬',
      estimatedDuration: 40
    });

    // Spanish flashcards
    const spanishCards = [
      // Module 1: Greetings
      { moduleId: spanishModule1.id, question: 'How do you say "Hello" in Spanish?', answer: 'Hola', hint: 'Very similar to the English word', explanation: '"Hola" is the most common greeting in Spanish-speaking countries.' },
      { moduleId: spanishModule1.id, question: 'How do you say "Good morning" in Spanish?', answer: 'Buenos días', hint: 'Think about "good days"', explanation: 'Used typically until noon.' },
      { moduleId: spanishModule1.id, question: 'How do you say "My name is..." in Spanish?', answer: 'Me llamo...', hint: 'Literally means "I call myself"', explanation: 'The verb "llamar" means "to call".' },
      { moduleId: spanishModule1.id, question: 'How do you say "Nice to meet you" in Spanish?', answer: 'Mucho gusto', hint: 'Think about "much pleasure"', explanation: 'Another common variant is "Encantado/a".' },
      { moduleId: spanishModule1.id, question: 'How do you say "Goodbye" in Spanish?', answer: 'Adiós', hint: 'Ends with an "s"', explanation: 'More casual options include "Hasta luego" (see you later).' },

      // Module 2: Numbers
      { moduleId: spanishModule2.id, question: 'What is "one" in Spanish?', answer: 'Uno', cardType: 'basic', explanation: 'The number 1 in Spanish.' },
      { moduleId: spanishModule2.id, question: 'What is "five" in Spanish?', answer: 'Cinco', cardType: 'basic', explanation: 'The number 5, as in "Cinco de Mayo".' },
      { moduleId: spanishModule2.id, question: 'What is "ten" in Spanish?', answer: 'Diez', cardType: 'basic', explanation: 'The number 10 in Spanish.' },
      { moduleId: spanishModule2.id, question: 'What is "red" in Spanish?', answer: 'Rojo', hint: 'Similar to "rouge"', explanation: 'The color red. Feminine form is "roja".' },
      { moduleId: spanishModule2.id, question: 'What is "blue" in Spanish?', answer: 'Azul', cardType: 'basic', explanation: 'The color blue, same for masculine and feminine.' },

      // Module 3: Common Phrases
      { moduleId: spanishModule3.id, question: 'How do you say "Thank you" in Spanish?', answer: 'Gracias', explanation: 'Universal expression of gratitude.' },
      { moduleId: spanishModule3.id, question: 'How do you say "Please" in Spanish?', answer: 'Por favor', explanation: 'Essential polite expression.' },
      { moduleId: spanishModule3.id, question: 'How do you say "Excuse me" in Spanish?', answer: 'Perdón or Disculpe', explanation: 'Both are commonly used.' },
      { moduleId: spanishModule3.id, question: 'How do you say "I don\'t understand" in Spanish?', answer: 'No entiendo', explanation: 'Very useful phrase when learning!' },
      { moduleId: spanishModule3.id, question: 'How do you say "Where is the bathroom?" in Spanish?', answer: '¿Dónde está el baño?', explanation: 'One of the most practical phrases for travelers!' }
    ];

    for (const card of spanishCards) {
      await Card.create({
        courseId: spanishCourse.id,
        moduleId: card.moduleId,
        userId: null, // Template card
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        explanation: card.explanation || null,
        cardType: card.cardType || 'basic',
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isActive: true
      });
    }

    await spanishCourse.update({ totalCards: spanishCards.length, activeCards: spanishCards.length });
    console.log(`✅ Created Spanish course with ${spanishCards.length} cards`);

    // ============================================
    // 2. PYTHON PROGRAMMING FUNDAMENTALS
    // ============================================
    const pythonCourse = await Course.create({
      title: 'Python Programming Fundamentals',
      description: 'Master the basics of Python programming. Learn syntax, data structures, functions, and object-oriented programming concepts.',
      icon: '🐍',
      color: '#3B82F6',
      category: 'Programming',
      difficulty: 'beginner',
      language: 'English',
      isFree: true,
      isPublished: true,
      isFeatured: true,
      createdBy: adminUser.id,
      totalCards: 0,
      activeCards: 0
    });

    // Modules for Python course
    const pythonModule1 = await CourseModule.create({
      courseId: pythonCourse.id,
      title: 'Python Basics',
      description: 'Variables, data types, and basic syntax',
      orderIndex: 1,
      icon: '📝',
      estimatedDuration: 45
    });

    const pythonModule2 = await CourseModule.create({
      courseId: pythonCourse.id,
      title: 'Control Flow',
      description: 'Conditionals and loops',
      orderIndex: 2,
      icon: '🔄',
      estimatedDuration: 50
    });

    const pythonModule3 = await CourseModule.create({
      courseId: pythonCourse.id,
      title: 'Functions and Data Structures',
      description: 'Functions, lists, dictionaries, and more',
      orderIndex: 3,
      icon: '📦',
      estimatedDuration: 60
    });

    // Python flashcards
    const pythonCards = [
      // Module 1: Basics
      {
        moduleId: pythonModule1.id,
        cardType: 'multiple_choice',
        question: 'Which of the following is the correct way to declare a variable in Python?',
        answer: 'x = 5',
        options: JSON.stringify(['var x = 5', 'x = 5', 'int x = 5', 'let x = 5']),
        explanation: 'Python uses simple assignment without type declarations.'
      },
      {
        moduleId: pythonModule1.id,
        question: 'What is the output of: print(type(5.0))?',
        answer: '<class \'float\'>',
        explanation: 'Numbers with decimal points are float type in Python.'
      },
      {
        moduleId: pythonModule1.id,
        question: 'What does the len() function do?',
        answer: 'Returns the length of an object (string, list, etc.)',
        explanation: 'len() is a built-in function to get the number of items.'
      },
      {
        moduleId: pythonModule1.id,
        cardType: 'true_false',
        question: 'Python is case-sensitive. True or False?',
        answer: 'True',
        explanation: 'Variable names like "myVar" and "myvar" are different in Python.'
      },
      {
        moduleId: pythonModule1.id,
        question: 'What is the difference between a list and a tuple in Python?',
        answer: 'Lists are mutable (can be changed), tuples are immutable (cannot be changed)',
        explanation: 'Lists use [] and tuples use ().'
      },

      // Module 2: Control Flow
      {
        moduleId: pythonModule2.id,
        question: 'What is the correct syntax for an if statement in Python?',
        answer: 'if condition:\n    statement',
        explanation: 'Note the colon and indentation - both are required in Python.'
      },
      {
        moduleId: pythonModule2.id,
        question: 'How do you create a for loop in Python?',
        answer: 'for item in iterable:\n    statement',
        explanation: 'Python uses the "in" keyword for iteration.'
      },
      {
        moduleId: pythonModule2.id,
        question: 'What does the "break" statement do in a loop?',
        answer: 'Exits the loop immediately',
        explanation: 'Break stops loop execution and continues with code after the loop.'
      },
      {
        moduleId: pythonModule2.id,
        question: 'What does the "continue" statement do in a loop?',
        answer: 'Skips the rest of the current iteration and moves to the next one',
        explanation: 'Continue jumps to the next iteration without executing remaining code.'
      },
      {
        moduleId: pythonModule2.id,
        cardType: 'multiple_choice',
        question: 'What is the output of: range(3)?',
        answer: 'A sequence: 0, 1, 2',
        options: JSON.stringify(['A sequence: 1, 2, 3', 'A sequence: 0, 1, 2', 'A sequence: 0, 1, 2, 3', 'The number 3']),
        explanation: 'range(n) generates numbers from 0 to n-1.'
      },

      // Module 3: Functions and Data Structures
      {
        moduleId: pythonModule3.id,
        question: 'How do you define a function in Python?',
        answer: 'def function_name(parameters):\n    statement',
        explanation: 'Use the "def" keyword followed by function name and parameters.'
      },
      {
        moduleId: pythonModule3.id,
        question: 'What does the "return" statement do in a function?',
        answer: 'Returns a value from the function to the caller',
        explanation: 'Functions without return statement return None by default.'
      },
      {
        moduleId: pythonModule3.id,
        question: 'How do you create an empty dictionary in Python?',
        answer: '{} or dict()',
        explanation: 'Both methods create an empty dictionary.'
      },
      {
        moduleId: pythonModule3.id,
        question: 'How do you add an item to a list?',
        answer: 'list.append(item)',
        explanation: 'append() adds an item to the end of the list.'
      },
      {
        moduleId: pythonModule3.id,
        cardType: 'multiple_choice',
        question: 'Which method removes and returns the last item from a list?',
        answer: 'pop()',
        options: JSON.stringify(['remove()', 'delete()', 'pop()', 'drop()']),
        explanation: 'pop() removes and returns the last item (or item at specified index).'
      }
    ];

    for (const card of pythonCards) {
      await Card.create({
        courseId: pythonCourse.id,
        moduleId: card.moduleId,
        userId: null,
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        explanation: card.explanation || null,
        cardType: card.cardType || 'basic',
        options: card.options || null,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isActive: true
      });
    }

    await pythonCourse.update({ totalCards: pythonCards.length, activeCards: pythonCards.length });
    console.log(`✅ Created Python course with ${pythonCards.length} cards`);

    // ============================================
    // 3. INTRODUCTION TO PSYCHOLOGY
    // ============================================
    const psychologyCourse = await Course.create({
      title: 'Introduction to Psychology',
      description: 'Explore the fascinating world of human behavior and mental processes. Learn about major psychological theories, research methods, and key concepts.',
      icon: '🧠',
      color: '#8B5CF6',
      category: 'Science',
      difficulty: 'beginner',
      language: 'English',
      isFree: true,
      isPublished: true,
      isFeatured: false,
      createdBy: adminUser.id,
      totalCards: 0,
      activeCards: 0
    });

    const psychModule1 = await CourseModule.create({
      courseId: psychologyCourse.id,
      title: 'Foundations of Psychology',
      description: 'History and major perspectives in psychology',
      orderIndex: 1,
      icon: '🏛️',
      estimatedDuration: 40
    });

    const psychModule2 = await CourseModule.create({
      courseId: psychologyCourse.id,
      title: 'Cognitive Psychology',
      description: 'Memory, learning, and thinking processes',
      orderIndex: 2,
      icon: '💭',
      estimatedDuration: 45
    });

    const psychCards = [
      {
        moduleId: psychModule1.id,
        question: 'Who is considered the father of modern psychology?',
        answer: 'Wilhelm Wundt',
        explanation: 'Wundt established the first psychology laboratory in 1879 in Leipzig, Germany.'
      },
      {
        moduleId: psychModule1.id,
        question: 'What is the main focus of behaviorism?',
        answer: 'Observable behavior rather than internal mental states',
        explanation: 'Behaviorists like Watson and Skinner focused on stimulus-response relationships.'
      },
      {
        moduleId: psychModule1.id,
        cardType: 'multiple_choice',
        question: 'Which perspective emphasizes unconscious drives and childhood experiences?',
        answer: 'Psychoanalytic',
        options: JSON.stringify(['Behavioral', 'Cognitive', 'Psychoanalytic', 'Humanistic']),
        explanation: 'Developed by Sigmund Freud, focusing on the unconscious mind.'
      },
      {
        moduleId: psychModule1.id,
        question: 'What is the biopsychosocial model?',
        answer: 'An approach that considers biological, psychological, and social-cultural factors',
        explanation: 'This holistic model recognizes that behavior has multiple influences.'
      },
      {
        moduleId: psychModule1.id,
        question: 'What does "nature vs. nurture" debate refer to?',
        answer: 'The relative influence of genetics versus environment on behavior',
        explanation: 'Modern psychology recognizes both factors interact to shape development.'
      },
      {
        moduleId: psychModule2.id,
        question: 'What are the three stages of memory according to the information-processing model?',
        answer: 'Encoding, storage, and retrieval',
        explanation: 'Information must be encoded, stored, and then retrieved to be remembered.'
      },
      {
        moduleId: psychModule2.id,
        question: 'What is the difference between short-term and long-term memory?',
        answer: 'Short-term memory holds information briefly (seconds to minutes), long-term memory stores information indefinitely',
        explanation: 'Short-term memory has limited capacity (~7 items), long-term is virtually unlimited.'
      },
      {
        moduleId: psychModule2.id,
        cardType: 'true_false',
        question: 'Working memory is the same as short-term memory. True or False?',
        answer: 'False',
        explanation: 'Working memory is an active system that manipulates information, not just holds it.'
      },
      {
        moduleId: psychModule2.id,
        question: 'What is "chunking" in memory?',
        answer: 'Grouping information into meaningful units to improve memory',
        explanation: 'For example, remembering a phone number as 555-1234 instead of 5551234.'
      },
      {
        moduleId: psychModule2.id,
        question: 'What is the spacing effect?',
        answer: 'The tendency to better remember information when study sessions are distributed over time',
        explanation: 'Spaced repetition is more effective than cramming for long-term retention!'
      }
    ];

    for (const card of psychCards) {
      await Card.create({
        courseId: psychologyCourse.id,
        moduleId: card.moduleId,
        userId: null,
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        explanation: card.explanation || null,
        cardType: card.cardType || 'basic',
        options: card.options || null,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isActive: true
      });
    }

    await psychologyCourse.update({ totalCards: psychCards.length, activeCards: psychCards.length });
    console.log(`✅ Created Psychology course with ${psychCards.length} cards`);

    // ============================================
    // 4. WORLD GEOGRAPHY
    // ============================================
    const geographyCourse = await Course.create({
      title: 'World Geography',
      description: 'Discover countries, capitals, landmarks, and geographical features from around the world. Perfect for trivia enthusiasts and travelers.',
      icon: '🌍',
      color: '#10B981',
      category: 'Geography',
      difficulty: 'intermediate',
      language: 'English',
      isFree: true,
      isPublished: true,
      isFeatured: false,
      createdBy: adminUser.id,
      totalCards: 0,
      activeCards: 0
    });

    const geoModule1 = await CourseModule.create({
      courseId: geographyCourse.id,
      title: 'Capitals of the World',
      description: 'Learn capitals of major countries',
      orderIndex: 1,
      icon: '🏛️',
      estimatedDuration: 50
    });

    const geoModule2 = await CourseModule.create({
      courseId: geographyCourse.id,
      title: 'Landmarks and Features',
      description: 'Famous landmarks and natural features',
      orderIndex: 2,
      icon: '🗿',
      estimatedDuration: 40
    });

    const geoCards = [
      { moduleId: geoModule1.id, question: 'What is the capital of France?', answer: 'Paris', explanation: 'Paris is also known as the "City of Light".' },
      { moduleId: geoModule1.id, question: 'What is the capital of Japan?', answer: 'Tokyo', explanation: 'Tokyo is the most populous metropolitan area in the world.' },
      { moduleId: geoModule1.id, question: 'What is the capital of Brazil?', answer: 'Brasília', explanation: 'Brasília was purpose-built as the capital in 1960.' },
      { moduleId: geoModule1.id, question: 'What is the capital of Australia?', answer: 'Canberra', explanation: 'Many people incorrectly think it\'s Sydney or Melbourne.' },
      { moduleId: geoModule1.id, question: 'What is the capital of Canada?', answer: 'Ottawa', explanation: 'Ottawa is located in the province of Ontario.' },
      { moduleId: geoModule1.id, question: 'What is the capital of Egypt?', answer: 'Cairo', explanation: 'Cairo is the largest city in Africa and the Arab world.' },
      { moduleId: geoModule1.id, question: 'What is the capital of South Korea?', answer: 'Seoul', explanation: 'Seoul is one of the most technologically advanced cities in the world.' },
      {
        moduleId: geoModule2.id,
        cardType: 'multiple_choice',
        question: 'What is the tallest mountain in the world?',
        answer: 'Mount Everest',
        options: JSON.stringify(['K2', 'Mount Everest', 'Kangchenjunga', 'Mount Kilimanjaro']),
        explanation: 'Mount Everest stands at 8,848.86 meters (29,031.7 feet) above sea level.'
      },
      { moduleId: geoModule2.id, question: 'What is the longest river in the world?', answer: 'The Nile River', explanation: 'The Nile is approximately 6,650 km (4,130 miles) long.' },
      { moduleId: geoModule2.id, question: 'What is the largest desert in the world?', answer: 'Antarctica (or Sahara for hot deserts)', explanation: 'Antarctica is technically the largest desert. The Sahara is the largest hot desert.' },
      { moduleId: geoModule2.id, question: 'What ocean is the largest?', answer: 'Pacific Ocean', explanation: 'The Pacific covers about 46% of Earth\'s water surface.' },
      { moduleId: geoModule2.id, question: 'Which country has the most time zones?', answer: 'France (12 time zones)', explanation: 'Due to overseas territories, France spans the most time zones.' }
    ];

    for (const card of geoCards) {
      await Card.create({
        courseId: geographyCourse.id,
        moduleId: card.moduleId,
        userId: null,
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        explanation: card.explanation || null,
        cardType: card.cardType || 'basic',
        options: card.options || null,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isActive: true
      });
    }

    await geographyCourse.update({ totalCards: geoCards.length, activeCards: geoCards.length });
    console.log(`✅ Created Geography course with ${geoCards.length} cards`);

    // ============================================
    // 5. BASIC CHEMISTRY CONCEPTS
    // ============================================
    const chemistryCourse = await Course.create({
      title: 'Basic Chemistry Concepts',
      description: 'Understand fundamental chemistry concepts including atoms, molecules, chemical reactions, and the periodic table.',
      icon: '⚗️',
      color: '#F59E0B',
      category: 'Science',
      difficulty: 'beginner',
      language: 'English',
      isFree: true,
      isPublished: true,
      isFeatured: false,
      createdBy: adminUser.id,
      totalCards: 0,
      activeCards: 0
    });

    const chemModule1 = await CourseModule.create({
      courseId: chemistryCourse.id,
      title: 'Atomic Structure',
      description: 'Atoms, elements, and the periodic table',
      orderIndex: 1,
      icon: '⚛️',
      estimatedDuration: 35
    });

    const chemModule2 = await CourseModule.create({
      courseId: chemistryCourse.id,
      title: 'Chemical Bonds and Reactions',
      description: 'How atoms combine and react',
      orderIndex: 2,
      icon: '🔗',
      estimatedDuration: 40
    });

    const chemCards = [
      { moduleId: chemModule1.id, question: 'What are the three subatomic particles?', answer: 'Protons, neutrons, and electrons', explanation: 'Protons and neutrons are in the nucleus, electrons orbit around it.' },
      { moduleId: chemModule1.id, question: 'What determines an element\'s atomic number?', answer: 'The number of protons', explanation: 'Each element has a unique number of protons.' },
      {
        moduleId: chemModule1.id,
        cardType: 'true_false',
        question: 'Electrons have a positive charge. True or False?',
        answer: 'False',
        explanation: 'Electrons have a negative charge. Protons are positive, neutrons are neutral.'
      },
      { moduleId: chemModule1.id, question: 'What is an isotope?', answer: 'Atoms of the same element with different numbers of neutrons', explanation: 'Isotopes have the same atomic number but different mass numbers.' },
      { moduleId: chemModule1.id, question: 'What is the most abundant element in the universe?', answer: 'Hydrogen', explanation: 'Hydrogen makes up about 75% of the universe\'s elemental mass.' },
      {
        moduleId: chemModule2.id,
        cardType: 'multiple_choice',
        question: 'What type of bond involves sharing electrons?',
        answer: 'Covalent bond',
        options: JSON.stringify(['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond']),
        explanation: 'Covalent bonds form when atoms share pairs of electrons.'
      },
      { moduleId: chemModule2.id, question: 'What is the chemical formula for water?', answer: 'H₂O', explanation: 'Two hydrogen atoms bonded to one oxygen atom.' },
      { moduleId: chemModule2.id, question: 'What is the difference between a reactant and a product?', answer: 'Reactants are substances that start a reaction, products are substances formed by the reaction', explanation: 'In A + B → C + D, A and B are reactants, C and D are products.' },
      { moduleId: chemModule2.id, question: 'What is a catalyst?', answer: 'A substance that speeds up a chemical reaction without being consumed', explanation: 'Catalysts lower the activation energy needed for reactions.' },
      { moduleId: chemModule2.id, question: 'What does pH measure?', answer: 'The acidity or basicity (alkalinity) of a solution', explanation: 'pH scale ranges from 0 (very acidic) to 14 (very basic), with 7 being neutral.' }
    ];

    for (const card of chemCards) {
      await Card.create({
        courseId: chemistryCourse.id,
        moduleId: card.moduleId,
        userId: null,
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        explanation: card.explanation || null,
        cardType: card.cardType || 'basic',
        options: card.options || null,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isActive: true
      });
    }

    await chemistryCourse.update({ totalCards: chemCards.length, activeCards: chemCards.length });
    console.log(`✅ Created Chemistry course with ${chemCards.length} cards`);

    // ============================================
    // 6. DIGITAL MARKETING ESSENTIALS
    // ============================================
    const marketingCourse = await Course.create({
      title: 'Digital Marketing Essentials',
      description: 'Learn the fundamentals of digital marketing including SEO, social media marketing, content marketing, and analytics.',
      icon: '📱',
      color: '#EC4899',
      category: 'Business',
      difficulty: 'intermediate',
      language: 'English',
      isFree: false,
      price: 500,
      priceType: 'coins',
      isPublished: true,
      isFeatured: true,
      createdBy: adminUser.id,
      totalCards: 0,
      activeCards: 0
    });

    const marketingModule1 = await CourseModule.create({
      courseId: marketingCourse.id,
      title: 'SEO Fundamentals',
      description: 'Search Engine Optimization basics',
      orderIndex: 1,
      icon: '🔍',
      estimatedDuration: 45
    });

    const marketingModule2 = await CourseModule.create({
      courseId: marketingCourse.id,
      title: 'Social Media Marketing',
      description: 'Strategies for social platforms',
      orderIndex: 2,
      icon: '📲',
      estimatedDuration: 40
    });

    const marketingCards = [
      { moduleId: marketingModule1.id, question: 'What does SEO stand for?', answer: 'Search Engine Optimization', explanation: 'SEO is the practice of improving website visibility in search engine results.' },
      { moduleId: marketingModule1.id, question: 'What are keywords in SEO?', answer: 'Words or phrases that users type into search engines', explanation: 'Targeting the right keywords helps your content reach the right audience.' },
      { moduleId: marketingModule1.id, question: 'What is the difference between on-page and off-page SEO?', answer: 'On-page SEO involves optimizing content on your website, off-page SEO involves external factors like backlinks', explanation: 'Both are important for ranking well in search results.' },
      {
        moduleId: marketingModule1.id,
        cardType: 'multiple_choice',
        question: 'What is a backlink?',
        answer: 'A link from another website to your website',
        options: JSON.stringify(['A link within your own website', 'A link from another website to your website', 'A broken link', 'A footer link']),
        explanation: 'Quality backlinks are important for SEO authority.'
      },
      { moduleId: marketingModule1.id, question: 'What is organic traffic?', answer: 'Visitors who find your website through unpaid search results', explanation: 'As opposed to paid traffic from advertisements.' },
      { moduleId: marketingModule2.id, question: 'What does engagement rate measure?', answer: 'How actively your audience interacts with your content (likes, comments, shares)', explanation: 'High engagement indicates content resonates with your audience.' },
      { moduleId: marketingModule2.id, question: 'What is a call-to-action (CTA)?', answer: 'A prompt that encourages users to take a specific action', explanation: 'Examples: "Sign up now", "Learn more", "Buy today".' },
      {
        moduleId: marketingModule2.id,
        cardType: 'true_false',
        question: 'Posting more frequently always leads to better results on social media. True or False?',
        answer: 'False',
        explanation: 'Quality and relevance are more important than quantity. Excessive posting can lead to unfollows.'
      },
      { moduleId: marketingModule2.id, question: 'What is user-generated content (UGC)?', answer: 'Content created by customers or users rather than the brand', explanation: 'UGC builds trust and authenticity. Examples: customer reviews, photos, testimonials.' },
      { moduleId: marketingModule2.id, question: 'What is A/B testing?', answer: 'Comparing two versions of content to see which performs better', explanation: 'Also called split testing, helps optimize marketing campaigns.' }
    ];

    for (const card of marketingCards) {
      await Card.create({
        courseId: marketingCourse.id,
        moduleId: card.moduleId,
        userId: null,
        question: card.question,
        answer: card.answer,
        hint: card.hint || null,
        explanation: card.explanation || null,
        cardType: card.cardType || 'basic',
        options: card.options || null,
        status: 'new',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isActive: true
      });
    }

    await marketingCourse.update({ totalCards: marketingCards.length, activeCards: marketingCards.length });
    console.log(`✅ Created Digital Marketing course with ${marketingCards.length} cards`);

    // Summary
    console.log('\n🎉 Demo course creation completed!');
    console.log('===================================');
    console.log('Created courses:');
    console.log('1. Spanish for Beginners (15 cards, 3 modules) - FREE, FEATURED');
    console.log('2. Python Programming Fundamentals (15 cards, 3 modules) - FREE, FEATURED');
    console.log('3. Introduction to Psychology (10 cards, 2 modules) - FREE');
    console.log('4. World Geography (12 cards, 2 modules) - FREE');
    console.log('5. Basic Chemistry Concepts (10 cards, 2 modules) - FREE');
    console.log('6. Digital Marketing Essentials (10 cards, 2 modules) - PAID (500 coins), FEATURED');
    console.log(`\nTotal: 72 flashcards across 6 courses`);

  } catch (error) {
    console.error('❌ Error creating demo courses:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createDemoCourses()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createDemoCourses;
