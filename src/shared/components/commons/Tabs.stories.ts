import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Tabs from './Tabs';

const meta = {
  title: 'Components/Commons/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      description: '탭 항목 배열',
      control: 'object',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: '탭1' },
      { id: 'tab2', label: '탭2' },
      { id: 'tab3', label: '탭3' },
    ],
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'home', label: '홈' },
      { id: 'profile', label: '프로필' },
    ],
  },
};

export const FourTabs: Story = {
  args: {
    tabs: [
      { id: 'all', label: '전체' },
      { id: 'pending', label: '대기중' },
      { id: 'active', label: '진행중' },
      { id: 'done', label: '완료' },
    ],
  },
};

export const EnglishTabs: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
      { id: 'settings', label: 'Settings' },
    ],
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: '1', label: '탭1' },
      { id: '2', label: '탭2' },
      { id: '3', label: '탭3' },
      { id: '4', label: '탭4' },
      { id: '5', label: '탭5' },
    ],
  },
};
