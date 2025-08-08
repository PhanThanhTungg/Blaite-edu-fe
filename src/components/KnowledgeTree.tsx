import React, { useMemo, useState } from 'react';
import { Input, Tree, Card, Typography } from 'antd';
import type { TreeDataNode } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

interface Knowledge {
  id: string;
  name: string;
  prompt: string;
  status: string;
  createdAt: string;
  children?: Knowledge[];
}

interface KnowledgeTreeProps {
  knowledges: Knowledge[];
  onSelect?: (knowledge: Knowledge) => void;
  className?: string;
}

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ 
  knowledges, 
  onSelect, 
  className = "" 
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // Convert knowledge data to tree format
  const convertToTreeData = (knowledgeList: Knowledge[]): TreeDataNode[] => {
    return knowledgeList.map((knowledge) => ({
      title: knowledge.name,
      key: knowledge.id,
      children: knowledge.children ? convertToTreeData(knowledge.children) : undefined,
      icon: <BookOutlined style={{ color: knowledge.status === 'active' ? '#52c41a' : '#ff4d4f' }} />,
    }));
  };

  const treeData = convertToTreeData(knowledges);

  // Generate flat list for search
  const dataList: { key: React.Key; title: string }[] = [];
  const generateList = (data: TreeDataNode[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key } = node;
      dataList.push({ key, title: node.title as string });
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  generateList(treeData);

  // Get parent key for expanding
  const getParentKey = (key: React.Key, tree: TreeDataNode[]): React.Key => {
    let parentKey: React.Key;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey!;
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          return getParentKey(item.key, treeData);
        }
        return null;
      })
      .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i));
    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    const selectedKey = selectedKeys[0];
    if (selectedKey && onSelect) {
      // Find the selected knowledge
      const findKnowledge = (knowledgeList: Knowledge[], key: string): Knowledge | null => {
        for (const knowledge of knowledgeList) {
          if (knowledge.id === key) {
            return knowledge;
          }
          if (knowledge.children) {
            const found = findKnowledge(knowledge.children, key);
            if (found) return found;
          }
        }
        return null;
      };
      
      const selectedKnowledge = findKnowledge(knowledges, selectedKey as string);
      if (selectedKnowledge) {
        onSelect(selectedKnowledge);
      }
    }
  };

  const processedTreeData = useMemo(() => {
    const loop = (data: TreeDataNode[]): TreeDataNode[] =>
      data.map((item) => {
        const strTitle = item.title as string;
        const index = strTitle.toLowerCase().indexOf(searchValue.toLowerCase());
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);
        const title =
          index > -1 ? (
            <span key={item.key}>
              {beforeStr}
              <span className="site-tree-search-value">{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span key={item.key}>{strTitle}</span>
          );
        if (item.children) {
          return { title, key: item.key, children: loop(item.children), icon: item.icon };
        }

        return {
          title,
          key: item.key,
          icon: item.icon,
        };
      });

    return loop(treeData);
  }, [searchValue, treeData]);

  return (
    <Card 
      title="Knowledge Tree" 
      className={className}
      extra={<SearchOutlined />}
    >
      <Search 
        style={{ marginBottom: 16 }} 
        placeholder="Search knowledge..." 
        onChange={onChange}
        allowClear
      />
             <Tree
         onExpand={onExpand}
         expandedKeys={expandedKeys}
         autoExpandParent={autoExpandParent}
         treeData={processedTreeData}
         onSelect={handleSelect}
         showIcon
         defaultExpandAll={false}
       />
    </Card>
  );
};

export default KnowledgeTree;
