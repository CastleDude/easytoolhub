"use client";

import { useEffect, useState, use } from "react";
import BlogForm from "@/components/admin/BlogForm";

export default function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (!post || post.error) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">文章未找到</p>
        <a href="/admin/blog" className="text-primary-600 hover:underline mt-2 inline-block">返回文章列表</a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">编辑文章</h2>
      <BlogForm initial={post} isNew={false} />
    </div>
  );
}
