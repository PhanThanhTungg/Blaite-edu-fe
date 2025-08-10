import React, { useMemo, useState } from 'react';
import { Input, Tree, Card, Typography, Button, Tooltip } from 'antd';
import type { TreeDataNode } from 'antd';
import { SearchOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Text } = Typography;

interface Knowledge {
  id: string;
  name: string;
  prompt: string;
  theory?: string;
  status: string;
  createdAt: string;
  children?: Knowledge[];
}

interface KnowledgeTreeProps {
  knowledges: Knowledge[];
  onSelect?: (knowledge: Knowledge) => void;
  className?: string;
  selectedKeys?: React.Key[];
  onExpandChange?: (expandedKeys: React.Key[]) => void;
}

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ 
  knowledges, 
  onSelect, 
  className = "",
  selectedKeys = [],
  onExpandChange
}) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const prevSelectedKeyRef = React.useRef<React.Key | null>(null);

  // Auto-expand nodes that have theory content (disabled for now)
  const getExpandedKeys = (knowledgeList: Knowledge[]): React.Key[] => {
    // Return empty array to not auto-expand theory nodes
    return [];
  };

  // Convert knowledge data to tree format
  const convertToTreeData = (knowledgeList: Knowledge[]): TreeDataNode[] => {
    return knowledgeList.map((knowledge) => {
      const hasChildren = knowledge.children && knowledge.children.length > 0;
      const hasTheory = knowledge.theory && knowledge.theory.length > 0;
      
      const title = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>{knowledge.name}</span>
        </div>
      );
      
      // Create children array including theory if exists
      let children: TreeDataNode[] = [];
      
      // Add existing children
      if (knowledge.children) {
        children = [...convertToTreeData(knowledge.children)];
      }
      
              // No longer adding theory nodes as children - using tabs instead
      
             return {
         title,
         key: knowledge.id,
         children: children.length > 0 ? children : undefined,
       };
    });
  };

  const treeData = useMemo(() => {
    const data = convertToTreeData(knowledges);
    console.log('🔍 Tree data created:', data);
    return data;
  }, [knowledges]);
  
  // Initialize expanded keys for nodes with theory
  React.useEffect(() => {
    const theoryKeys = getExpandedKeys(knowledges);
    console.log('🔍 Auto-expanding nodes with theory:', theoryKeys);
    setExpandedKeys(prev => [...new Set([...prev, ...theoryKeys])]);
  }, [knowledges]);

  // Auto-expand to show selected node
  React.useEffect(() => {
    if (selectedKeys.length > 0) {
      const selectedKey = selectedKeys[0];
      
      // Only expand if the selected key has changed
      if (prevSelectedKeyRef.current !== selectedKey) {
        prevSelectedKeyRef.current = selectedKey;
        
        // Find all parent keys for the selected node
        const findParentKeys = (data: TreeDataNode[], targetKey: React.Key, parents: React.Key[] = []): React.Key[] => {
          for (const node of data) {
            if (node.key === targetKey) {
              return parents;
            }
            if (node.children) {
              const found = findParentKeys(node.children, targetKey, [...parents, node.key]);
              if (found.length > 0 || node.children.some(child => child.key === targetKey)) {
                return [...parents, node.key];
              }
            }
          }
          return [];
        };

        const parentKeys = findParentKeys(treeData, selectedKey);
        console.log('🔍 Auto-expanding parent nodes for selected key:', selectedKey, 'Parents:', parentKeys);
        
        if (parentKeys.length > 0) {
          setExpandedKeys(prev => {
            const newKeys = [...new Set([...prev, ...parentKeys])];
            console.log('🔍 New expanded keys:', newKeys);
            return newKeys;
          });
          setAutoExpandParent(true);
        }
      }
    } else {
      // Reset when no selection
      prevSelectedKeyRef.current = null;
    }
  }, [selectedKeys, treeData]);

  // Generate flat list for search
  const dataList: { key: React.Key; title: string }[] = [];
  const generateList = (data: TreeDataNode[]) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key } = node;
      // Extract text content from title (handle both string and React element)
      let titleText = '';
      if (typeof node.title === 'string') {
        titleText = node.title;
      } else if (React.isValidElement(node.title)) {
        // Extract text from React element (simple approach)
        const element = node.title as React.ReactElement;
        if (element.props && element.props.children) {
          if (typeof element.props.children === 'string') {
            titleText = element.props.children;
          } else if (Array.isArray(element.props.children)) {
            titleText = element.props.children
              .map((child: any) => typeof child === 'string' ? child : '')
              .join('');
          }
        }
      }
      dataList.push({ key, title: titleText });
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
    if (onExpandChange) {
      onExpandChange(newExpandedKeys);
    }
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
      // Find the selected knowledge - simplified since we no longer have theory nodes
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
        // Handle both string and React element titles
        const originalTitle = item.title;
        let title = originalTitle;
        
        if (typeof originalTitle === 'string' && searchValue) {
          const strTitle = originalTitle;
          const index = strTitle.toLowerCase().indexOf(searchValue.toLowerCase());
          if (index > -1) {
            const beforeStr = strTitle.substring(0, index);
            const afterStr = strTitle.slice(index + searchValue.length);
            title = (
              <span key={item.key}>
                {beforeStr}
                <span className="site-tree-search-value">{searchValue}</span>
                {afterStr}
              </span>
            );
          }
        }
        
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
    <div className={className}>
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
        selectedKeys={selectedKeys}
        showIcon
        defaultExpandAll={false}
      />
    </div>
  );
};

export default KnowledgeTree;
