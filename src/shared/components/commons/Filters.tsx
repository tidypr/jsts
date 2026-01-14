import { useState } from 'react';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const periods = [
  { value: 'daily', label: '일간' },
  { value: 'weekly', label: '주간' },
  { value: 'monthly', label: '월간' },
  { value: 'all', label: '전체' },
] as const;

const categories = [
  { value: 'all', label: '전체' },
  { value: 'math', label: '수학', icon: '📐' },
  { value: 'english', label: '영어', icon: '📚' },
  { value: 'science', label: '과학', icon: '🔬' },
  { value: 'coding', label: '코딩', icon: '💻' },
  { value: 'reading', label: '독서', icon: '📖' },
];

export default function Filters() {
  const [selectedPeriod, setSelectedPeriod] =
    useState<(typeof periods)[number]['value']>('weekly');
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]['value']>('all');

  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label className='text-sm text-muted-foreground'>기간</Label>
          <Select
            value={selectedPeriod}
            onValueChange={(value) =>
              setSelectedPeriod(value as typeof selectedPeriod)
            }
          >
            <SelectTrigger className='' data-testid='rank-period-select'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className=''>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label className='text-sm text-muted-foreground'>카테고리</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className='' data-testid='rank-category-select'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className=''>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className='flex items-center gap-2'>
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
