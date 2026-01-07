import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import Tabs from './Tabs';

type TabsStoryArgs = {
  tabs: { id: string; label: string }[];
  activeTab?: string;
  disabled?: boolean;
};

const meta = {
  title: 'Components/Commons/Tabs',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      description: '탭 항목 배열',
      control: 'object',
    },
    activeTab: {
      description: '현재 활성화된 탭 ID (초기값)',
      control: 'text',
    },
    disabled: {
      description: '탭 비활성화 여부',
      control: 'boolean',
    },
  },
  render: (args: TabsStoryArgs) => {
    const [activeTab, setActiveTab] = useState(args.activeTab || args.tabs[0]?.id || '');
    return <Tabs tabs={args.tabs} disabled={args.disabled} activeTab={activeTab} setActiveTab={setActiveTab} />;
  },
} satisfies Meta<TabsStoryArgs>;

export default meta;
type Story = StoryObj<TabsStoryArgs>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: '탭1' },
      { id: 'tab2', label: '탭2' },
      { id: 'tab3', label: '탭3' },
    ],
    disabled: false,
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'home', label: '홈' },
      { id: 'profile', label: '프로필' },
    ],
    disabled: false,
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
    disabled: false,
  },
};

export const EnglishTabs: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
      { id: 'settings', label: 'Settings' },
    ],
    disabled: false,
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
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: '탭1' },
      { id: 'tab2', label: '탭2' },
      { id: 'tab3', label: '탭3' },
    ],
    disabled: true,
  },
};

export const PreselectedTab: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: '탭1' },
      { id: 'tab2', label: '탭2' },
      { id: 'tab3', label: '탭3' },
    ],
    activeTab: 'tab2',
    disabled: false,
  },
};
