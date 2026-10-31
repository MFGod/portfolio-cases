import type { CaseText, CompanyText, HomeText, MemberText, SolutionText, Studio } from '../content';

export const studio: Studio = {
  tagline: '',
  address: 'Moscow, Sushchevsky Val 18, office 504',
  hours: 'Mon–Fri, 10:00–19:00',
  legal: 'Punktir LLC',
};

export const home: HomeText = {
  title: 'Services, apps and websites',
  lead: 'We design, build and support digital products for business.',
  stages: [
    {
      when: '',
      title: 'Understand the task',
      note: 'Product goals and scenarios',
      artifact: 'We define the users, their main actions and the integration requirements.',
    },
    {
      when: '',
      title: 'Design',
      note: 'Structure and prototype',
      artifact:
        'We work out how the product is organised and test the main scenarios on a prototype.',
    },
    {
      when: '',
      title: 'Build',
      note: 'Interface and back end',
      artifact: 'We build the product features, connect external systems and check error handling.',
    },
    {
      when: '',
      title: 'Launch and support',
      note: 'Testing and maintenance',
      artifact:
        'We prepare the product for launch and hand over the code and documentation. We plan updates and support.',
    },
  ],
  seo: {
    title: 'Punktir: building services, apps and websites',
    description:
      'Web services, mobile apps and corporate websites. Integrations with business systems and product support.',
  },
};

export const company: CompanyText = {
  title: 'About the company',
  intro:
    'Punktir designs and builds digital products for business. We create web services, mobile apps and corporate websites, connect them to working systems and support them after launch.',
  facts: [
    { value: 'From design to support', label: 'Product work' },
    { value: 'Web and mobile', label: 'Platforms' },
    { value: 'CRM and internal systems', label: 'Integrations' },
    { value: 'Code and documentation', label: 'Handover' },
  ],
  principles: [
    {
      title: 'We start with scenarios',
      text: 'We find out who will use the product and which tasks it has to solve. The interface is designed from there.',
    },
    {
      title: 'We agree on requirements',
      text: 'Before development we describe how the product behaves and how it will be accepted. Changes are discussed together with their effect on scope.',
    },
    {
      title: 'We account for working systems',
      text: 'We check the available data exchange interfaces, access rights and how integration errors are handled.',
    },
    {
      title: 'We prepare for maintenance',
      text: 'We hand over the code and documentation and describe how updates are made. We discuss support and further development.',
    },
  ],
  seo: {
    title: 'About Punktir',
    description: 'Design, development and support of digital products for business.',
  },
};

export const solutions: Record<string, SolutionText> = {
  support: {
    title: 'Web services',
    summary: 'Client accounts and work tools in the browser.',
    body: 'We build services for clients and staff: from submitting a request to handling orders and documents. We design user roles and connect the systems the service needs.',
    steps: [
      {
        title: 'User scenarios',
        text: 'We describe who works with the service and what they need to do: a client, an employee, an administrator.',
      },
      {
        title: 'Interface prototype',
        text: 'We put together a prototype of the main screens and review it with the client team.',
      },
      {
        title: 'Development and integrations',
        text: 'We build the interface and the back end and connect the CRM, payments and other systems.',
      },
      {
        title: 'Testing and launch',
        text: 'We test the scenarios, migrate the data and open the service to users.',
      },
    ],
    seo: { title: 'Web services', description: 'Client accounts and work tools in the browser.' },
  },
  documents: {
    title: 'Corporate websites',
    summary: 'Company products, services and materials with easy content management.',
    body: 'We design the site structure and product pages. We connect contact forms and a content editor so the team can update materials on its own.',
    steps: [
      {
        title: 'Structure and content',
        text: 'We gather the sections and materials clients need: products, documents, contacts.',
      },
      {
        title: 'Page design',
        text: 'We design the key pages and the shared blocks the team later uses to build new ones.',
      },
      {
        title: 'Development and content editor',
        text: 'We build the pages and connect an editor so texts and documents are updated without a developer.',
      },
      {
        title: 'Testing and publishing',
        text: 'We check the forms, speed and phone layouts, then publish the site.',
      },
    ],
    seo: {
      title: 'Corporate websites',
      description: 'Company products, services and materials with easy content management.',
    },
  },
  triage: {
    title: 'Integrations',
    summary: 'Data exchange between the product and business systems.',
    body: 'We connect websites and apps to CRM, payment services and internal systems. We describe the exchange rules and test resending and recovery after errors.',
    steps: [
      {
        title: 'Systems and data flows',
        text: 'We list the systems and the data they exchange: requests, orders, statuses.',
      },
      {
        title: 'Exchange rules',
        text: 'We agree on formats, timing and which system owns each field.',
      },
      {
        title: 'Connecting interfaces',
        text: 'We connect APIs, queues and exports and set up access and an exchange log.',
      },
      {
        title: 'Errors and retries',
        text: 'We test resending, connection failures and recovery so data is neither lost nor duplicated.',
      },
    ],
    seo: {
      title: 'Integrations',
      description: 'Data exchange between the product and business systems.',
    },
  },
  booking: {
    title: 'Mobile apps',
    summary: 'Mobile apps for bookings, orders and services.',
    body: 'We build apps with a client account, service selection and online payment. We work out notifications, transaction history and the link to the accounting system.',
    steps: [
      {
        title: 'Main client actions',
        text: 'We pick what clients do most often in the app: book, pay, check their history.',
      },
      {
        title: 'Mobile interface',
        text: 'We design screens for one-handed use and test them on a prototype on a phone.',
      },
      {
        title: 'Services and integrations',
        text: 'We connect the service catalogue, payments, notifications and the accounting system.',
      },
      {
        title: 'Testing and release',
        text: 'We test the app on different devices and publish it in the app stores.',
      },
    ],
    seo: { title: 'Mobile apps', description: 'Mobile apps for bookings, orders and services.' },
  },
};

export const cases: Record<string, CaseText> = {
  'clinic-booking': {
    title: 'Client account',
    summary: 'A service for clinic clients: bookings, services and online payment.',
    task: 'A client needs to choose a service and a free slot, see upcoming appointments and pay for services in one app.',
    approach:
      'The account shows services, the schedule and booking history. The client picks a time, checks the details and goes on to payment.',
    metrics: [],
    timeline: [
      { when: '', title: 'Booking', text: 'Choosing a service, a specialist and a free slot.' },
      {
        when: '',
        title: 'Account',
        text: 'Upcoming appointments, service history and client details.',
      },
      {
        when: '',
        title: 'Payment',
        text: 'Checking the amount, the payment status and the booking confirmation.',
      },
    ],
    seo: {
      title: 'Client account',
      description: 'A service for clinic clients: bookings, services and online payment.',
    },
  },
  'returns-desk': {
    title: 'Online store returns',
    summary: 'Filing a return and tracking the request in the client account.',
    task: 'A buyer needs to pick items from an order and file a return. Store staff need the request details and its processing history.',
    approach:
      'The service links the request to the order and shows the actions available for its status. The buyer gives a reason for the return, and staff check the details and update the status.',
    metrics: [],
    timeline: [
      {
        when: '',
        title: 'Return request',
        text: 'Choosing the order, the items and the reason for return.',
      },
      {
        when: '',
        title: 'Store workspace',
        text: 'Checking details and managing request statuses.',
      },
      {
        when: '',
        title: 'Data exchange',
        text: 'Links to orders, payments and buyer notifications.',
      },
    ],
    seo: {
      title: 'Online store returns',
      description: 'Filing a return and tracking the request in the client account.',
    },
  },
  'freight-claims': {
    title: 'Logistics account',
    summary: 'Requests, shipments and documents in one workspace.',
    task: 'A client needs access to shipment statuses and documents. A dispatcher needs to receive requests with their details and pass them to the accounting system.',
    approach:
      'The account brings together shipment cards, documents and requests. The integration sends requests to the working system and returns status updates.',
    metrics: [],
    timeline: [
      { when: '', title: 'Shipments', text: 'Shipment cards, details and current statuses.' },
      {
        when: '',
        title: 'Requests',
        text: 'A request form linked to the shipment and its documents.',
      },
      {
        when: '',
        title: 'Integration',
        text: 'Sending requests and checking updates from the accounting system.',
      },
    ],
    seo: {
      title: 'Logistics account',
      description: 'Requests, shipments and documents in one workspace.',
    },
  },
  'policy-answers': {
    title: 'Corporate website',
    summary: 'Products, documents and contact forms for the company clients.',
    task: 'A visitor needs to understand the products, find the terms and contact the company. An editor needs a way to update pages and documents.',
    approach:
      'The site brings together the product catalogue, the documents section and contact forms. The editor manages page content and reviews changes before publishing.',
    metrics: [],
    timeline: [
      {
        when: '',
        title: 'Site structure',
        text: 'Product sections, materials and paths to contact forms.',
      },
      { when: '', title: 'Pages and documents', text: 'Product cards, terms and related files.' },
      {
        when: '',
        title: 'Content editor',
        text: 'Updating materials and previewing them before publishing.',
      },
    ],
    seo: {
      title: 'Corporate website',
      description: 'Products, documents and contact forms for the company clients.',
    },
  },
  'school-support': {
    title: 'Online school account',
    summary: 'Courses, schedule and study materials in the student account.',
    task: 'A student needs to see their courses, find upcoming classes and open materials. An administrator needs to manage access to learning.',
    approach:
      'The account shows available courses, the schedule and class materials. Access rights follow course enrollment, and requests can be sent from the study section.',
    metrics: [],
    timeline: [
      { when: '', title: 'Study sections', text: 'Courses, classes and related study materials.' },
      {
        when: '',
        title: 'Access to learning',
        text: 'Enrollment, student rights and states of unavailable materials.',
      },
      {
        when: '',
        title: 'Schedule and requests',
        text: 'Upcoming classes and contact with the administrator.',
      },
    ],
    seo: {
      title: 'Online school account',
      description: 'Courses, schedule and study materials in the student account.',
    },
  },
};

export const team: Record<string, MemberText> = {
  'anna-orlova': {
    name: 'Anna Orlova',
    role: 'Technical lead',
    bio: 'Designs the product architecture and agrees on technical decisions. Runs code review and the handover to maintenance.',
  },
  'ilya-shatrov': {
    name: 'Ilya Shatrov',
    role: 'Web service developer',
    bio: 'Builds server logic, data handling and access rights. Tests the main scenarios and error handling.',
  },
  'vera-kim': {
    name: 'Vera Kim',
    role: 'Front-end developer',
    bio: 'Builds website and web service interfaces. Works on responsive layouts, accessibility and user scenario tests.',
  },
  'timur-gaziev': {
    name: 'Timur Gaziev',
    role: 'Integration engineer',
    bio: 'Connects products to CRM, payment services and internal systems. Designs data exchange and recovery after errors.',
  },
  'olga-reshetova': {
    name: 'Olga Reshetova',
    role: 'Systems analyst',
    bio: 'Describes processes, user roles and product requirements. Agrees on integration scenarios and acceptance criteria.',
  },
  'pavel-dronov': {
    name: 'Pavel Dronov',
    role: 'Mobile developer',
    bio: 'Builds mobile interfaces, notifications and API work. Tests app states and scenarios on devices.',
  },
};
