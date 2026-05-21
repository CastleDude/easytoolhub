"use client";

import BlogForm from "@/components/admin/BlogForm";

export default function NewBlogPost() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">新建博客文章</h2>
      <BlogForm isNew />
    </div>
  );
}
