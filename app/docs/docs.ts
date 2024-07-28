import { type StructuredSidebarProps } from '@/components/Sidebar'

export const docs: StructuredSidebarProps =
[
  {
    text: 'README',
    link: '/docs/readme'
  },
  {
    text: 'Values',
    link: '/docs/values'
  },
  {
    name: 'Leadership',
    entries: [
      {
        text: 'About',
        link: '/docs/leadership/about'
      },
      {
        text: 'Joining',
        link: '/docs/leadership/joining'
      }
    ]
  },
  {
    name: 'Web Platform',
    entries: [
      {
        text: 'Why publish',
        link: '/docs/web-platform/why-publish'
      },
      {
        text: 'How to publish',
        link: '/docs/web-platform/how-to-publish'
      }
    ]
  }
]
