'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

// 全局唯一ID生成器，用于防止重复初始化
let editorIdCounter = 0;

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '开始编辑...',
  error = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const isInitializingRef = useRef<boolean>(false);
  const editorIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 为每个编辑器实例生成唯一ID
  const uniqueId = useMemo(() => {
    if (!editorIdRef.current) {
      editorIdRef.current = `quill-editor-${++editorIdCounter}-${Date.now()}`;
    }
    return editorIdRef.current;
  }, []);

  // 压缩图片函数
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 限制最大尺寸为 1200px
          const maxSize = 1200;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // 压缩质量为 0.8
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 初始化Quill编辑器
  useEffect(() => {
    // 防止在服务端执行
    if (typeof window === 'undefined') return;
    
    // 防止重复初始化
    if (isInitializingRef.current || isLoaded || quillInstanceRef.current) {
      return;
    }

    // 确保DOM元素存在
    if (!editorRef.current) {
      return;
    }

    // 检查是否已经初始化（通过检查DOM中是否存在Quill元素）
    if (editorRef.current.querySelector('.ql-toolbar') || 
        editorRef.current.querySelector('.ql-container') ||
        editorRef.current.querySelector('.ql-editor')) {
      setIsLoaded(true);
      return;
    }

    // 标记正在初始化
    isInitializingRef.current = true;

    const initQuill = async () => {
      try {
        // 再次检查，防止异步过程中重复初始化
        if (quillInstanceRef.current || !editorRef.current) {
          isInitializingRef.current = false;
          return;
        }

        const QuillModule = await import('quill');
        const Quill = QuillModule.default;

        // 加载CSS（只加载一次）
        if (!document.querySelector('link[href*="quill.snow.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
          document.head.appendChild(link);
        }

        // 最终检查DOM元素
        if (!editorRef.current) {
          isInitializingRef.current = false;
          return;
        }

        // 再次检查是否已经初始化（通过检查DOM和ID）
        if (editorRef.current.querySelector('.ql-toolbar') || 
            editorRef.current.getAttribute('data-quill-initialized') === 'true') {
          setIsLoaded(true);
          isInitializingRef.current = false;
          return;
        }

        // 自定义图片处理器
        const imageHandler = () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
              alert('图片大小不能超过5MB');
              return;
            }

            try {
              const base64 = await compressImage(file);
              const quill = quillInstanceRef.current;
              if (quill) {
                const range = quill.getSelection(true);
                if (range) {
                  quill.insertEmbed(range.index, 'image', base64);
                  quill.setSelection(range.index + 1);
                }
              }
            } catch (error) {
              console.error('图片处理失败:', error);
              alert('图片处理失败，请重试');
            }
          };
        };

        // 创建Quill实例
        const quill = new Quill(editorRef.current, {
          theme: 'snow',
          placeholder: placeholder,
          modules: {
            toolbar: {
              container: [
                [{ 'header': [1, 2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote'],
                ['link', 'image'],
                ['clean'],
              ],
              handlers: {
                image: imageHandler,
              },
            },
            clipboard: {
              matchVisual: false,
            },
          },
        });

        // 设置初始内容
        if (value) {
          quill.root.innerHTML = value;
        }

        // 监听内容变化
        quill.on('text-change', () => {
          const html = quill.root.innerHTML;
          if (html !== value) {
            onChange(html);
          }
        });

        quillInstanceRef.current = quill;
        // 标记为已初始化
        if (editorRef.current) {
          editorRef.current.setAttribute('data-quill-initialized', 'true');
        }
        setIsLoaded(true);
        isInitializingRef.current = false;
      } catch (error) {
        console.error('初始化Quill失败:', error);
        isInitializingRef.current = false;
      }
    };

    // 延迟初始化，确保DOM完全渲染
    const timer = setTimeout(() => {
      initQuill();
    }, 0);

    // 清理函数
    return () => {
      clearTimeout(timer);
      if (quillInstanceRef.current) {
        try {
          // 尝试销毁Quill实例
          const editorElement = editorRef.current;
          if (editorElement) {
            // 清除初始化标记
            editorElement.removeAttribute('data-quill-initialized');
            // 清除Quill添加的DOM元素
            const toolbar = editorElement.querySelector('.ql-toolbar');
            const container = editorElement.querySelector('.ql-container');
            if (toolbar) toolbar.remove();
            if (container) container.remove();
          }
        } catch (e) {
          // 忽略清理错误
        }
        quillInstanceRef.current = null;
      }
      isInitializingRef.current = false;
      setIsLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 同步外部value变化（仅在外部变化时更新）
  useEffect(() => {
    if (quillInstanceRef.current && value !== quillInstanceRef.current.root.innerHTML) {
      const selection = quillInstanceRef.current.getSelection();
      quillInstanceRef.current.root.innerHTML = value;
      if (selection) {
        quillInstanceRef.current.setSelection(selection);
      }
    }
  }, [value]);

  return (
    <div className={`rich-text-editor ${error ? 'error' : ''}`} data-editor-id={uniqueId}>
      <div ref={editorRef} style={{ minHeight: '300px' }} data-quill-editor={uniqueId} />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          font-size: 16px;
          font-family: inherit;
          min-height: 300px;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 300px;
          line-height: 1.6;
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #999;
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        
        .rich-text-editor.error .ql-toolbar,
        .rich-text-editor.error .ql-container {
          border-color: #ef4444;
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: #FFD700;
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #FFD700;
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #FFD700;
        }
        
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3 {
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .rich-text-editor .ql-editor h1 {
          font-size: 2rem;
        }
        
        .rich-text-editor .ql-editor h2 {
          font-size: 1.5rem;
        }
        
        .rich-text-editor .ql-editor h3 {
          font-size: 1.25rem;
        }
        
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid #FFD700;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #666;
          font-style: italic;
        }
        
        .rich-text-editor .ql-editor code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        
        .rich-text-editor .ql-editor pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
