import { config, fields, collection, singleton } from "@keystatic/core";

export default config({
  storage: {
    kind: "github",
    repo: "sethraj14/bitguru",
  },

  ui: {
    brand: {
      name: "BitGuru Admin",
    },
  },

  singletons: {
    siteConfig: singleton({
      label: "Site Settings",
      path: "src/content/site",
      format: { data: "json" },
      schema: {
        name: fields.text({ label: "Site Name" }),
        tagline: fields.text({ label: "Tagline" }),
        description: fields.text({ label: "Description", multiline: true }),
        contact: fields.object(
          {
            email: fields.text({ label: "Email" }),
            phone: fields.text({ label: "Phone" }),
            address: fields.text({ label: "Address" }),
          },
          { label: "Contact Info" }
        ),
        social: fields.object(
          {
            twitter: fields.url({ label: "Twitter / X" }),
            youtube: fields.url({ label: "YouTube" }),
            telegram: fields.url({ label: "Telegram" }),
            discord: fields.url({ label: "Discord" }),
            instagram: fields.url({ label: "Instagram" }),
          },
          { label: "Social Links" }
        ),
        navigation: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.text({ label: "URL Path" }),
          }),
          {
            label: "Navigation Links",
            itemLabel: (props) => props.fields.label.value || "New link",
          }
        ),
        cta: fields.object(
          {
            primary: fields.object(
              {
                label: fields.text({ label: "Label" }),
                href: fields.text({ label: "URL Path" }),
              },
              { label: "Primary CTA" }
            ),
            secondary: fields.object(
              {
                label: fields.text({ label: "Label" }),
                href: fields.text({ label: "URL Path" }),
              },
              { label: "Secondary CTA" }
            ),
          },
          { label: "Call to Action Buttons" }
        ),
        features: fields.object(
          {
            checkout: fields.checkbox({ label: "Enable Checkout", defaultValue: false }),
            booking: fields.checkbox({ label: "Enable Booking", defaultValue: false }),
          },
          { label: "Feature Flags" }
        ),
      },
    }),
  },

  collections: {
    courses: collection({
      label: "Courses",
      slugField: "title",
      path: "src/content/courses/*",
      format: { data: "json" },
      columns: ["title", "level", "price"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        slug: fields.text({ label: "URL Slug" }),
        description: fields.text({ label: "Short Description", multiline: true }),
        longDescription: fields.text({
          label: "Long Description",
          multiline: true,
        }),
        price: fields.number({ label: "Price (USD)", validation: { min: 0 } }),
        originalPrice: fields.number({ label: "Original Price (USD)" }),
        currency: fields.text({ label: "Currency", defaultValue: "USD" }),
        duration: fields.text({ label: "Duration (e.g. 8 weeks)" }),
        level: fields.select({
          label: "Level",
          options: [
            { label: "Beginner", value: "beginner" },
            { label: "Intermediate", value: "intermediate" },
            { label: "Advanced", value: "advanced" },
          ],
          defaultValue: "beginner",
        }),
        modules: fields.number({ label: "Number of Modules" }),
        lessons: fields.number({ label: "Number of Lessons" }),
        image: fields.text({ label: "Image Path (e.g. /images/courses/name.jpg)" }),
        instructor: fields.text({ label: "Instructor", defaultValue: "BitGuru Team" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value || "New tag",
        }),
        featured: fields.checkbox({ label: "Featured?", defaultValue: false }),
        comingSoon: fields.checkbox({ label: "Coming Soon?", defaultValue: false }),
      },
    }),

    testimonials: collection({
      label: "Testimonials",
      slugField: "name",
      path: "src/content/testimonials/*",
      format: { data: "json" },
      columns: ["name", "role", "rating"],
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        role: fields.text({ label: "Role / Title" }),
        avatar: fields.text({ label: "Avatar URL (optional)" }),
        quote: fields.text({ label: "Quote", multiline: true }),
        rating: fields.number({
          label: "Rating (1-5)",
          validation: { min: 1, max: 5 },
          defaultValue: 5,
        }),
        course: fields.text({ label: "Course Taken (optional)" }),
        featured: fields.checkbox({ label: "Featured?", defaultValue: false }),
      },
    }),

    blog: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "src/content/blog/*",
      format: { contentField: "content" },
      columns: ["title", "pubDate", "author"],
      entryLayout: "content",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "SEO Description", multiline: true }),
        pubDate: fields.date({ label: "Publish Date" }),
        author: fields.text({ label: "Author", defaultValue: "BitGuru Team" }),
        image: fields.text({ label: "Cover Image Path (optional)" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value || "New tag",
        }),
        draft: fields.checkbox({ label: "Draft?", defaultValue: false }),
        content: fields.mdx({ label: "Content" }),
      },
    }),
  },
});
