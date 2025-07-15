'use client';

import { Input, Select, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface SearchFilterBarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  filterDifficulty: string;
  onDifficultyChange: (value: string) => void;
  dateRange?: any;
  onDateRangeChange?: (dates: any) => void;
  showExport?: boolean;
  showImport?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  categoryOptions?: Array<{ label: string; value: string }>;
  difficultyOptions?: Array<{ label: string; value: string }>;
  className?: string;
}

export default function SearchFilterBar({
  searchText,
  onSearchChange,
  filterCategory,
  onCategoryChange,
  filterDifficulty,
  onDifficultyChange,
  dateRange,
  onDateRangeChange,
  showExport = false,
  showImport = false,
  onExport,
  onImport,
  categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Programming', value: 'Programming' },
    { label: 'Frontend', value: 'Frontend' },
    { label: 'Backend', value: 'Backend' },
    { label: 'Computer Science', value: 'Computer Science' },
  ],
  difficultyOptions = [
    { label: 'All Difficulties', value: 'all' },
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
  ],
  className = ""
}: SearchFilterBarProps) {
  return (
    <div className={`flex flex-col lg:flex-row gap-4 items-start lg:items-center ${className}`}>
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        className="lg:w-80"
        allowClear
      />
      
      <Select
        placeholder="Filter by category"
        value={filterCategory}
        onChange={onCategoryChange}
        className="lg:w-48"
        allowClear
        options={categoryOptions}
      />
      
      <Select
        placeholder="Filter by difficulty"
        value={filterDifficulty}
        onChange={onDifficultyChange}
        className="lg:w-48"
        allowClear
        options={difficultyOptions}
      />
      
      {onDateRangeChange && (
        <RangePicker
          placeholder={['Start Date', 'End Date']}
          value={dateRange}
          onChange={onDateRangeChange}
          className="lg:w-64"
        />
      )}
      
      <div className="flex gap-2">
        {showExport && onExport && (
          <Button icon={<ExportOutlined />} onClick={onExport}>
            Export
          </Button>
        )}
        {showImport && onImport && (
          <Button icon={<ImportOutlined />} onClick={onImport}>
            Import
          </Button>
        )}
      </div>
    </div>
  );
} 