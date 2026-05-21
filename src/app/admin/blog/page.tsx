"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";

interface Post {
  id: number;
  title: string;
  slug: string;
  category: string;
  date: string;
  created_at: string;
}

export default function AdminBlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/blog/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    }
    setDeleteId(null);
  }

  const columns = [
    { key: "title", label: "标题", sortable: true },
    {
      key: "category",
      label: "分类",
      sortable: true,
      render: (row: Post) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {row.category}
        </span>
      ),
    },
    { key: "date", label: "日期", sortable: true },
    {
      key: "actions",
      label: "操作",
      render: (row: Post) => (
        <div className="flex gap-2">
          <a
            href={`/admin/blog/${row.id}/edit`}
            className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            编辑
          </a>
          <button
            onClick={() => setDeleteId(row.id)}
            className="px-3 py-1 text-xs font-medium bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">博客文章</h2>
        <a
          href="/admin/blog/new"
          className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          + 新建文章
        </a>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <DataTable columns={columns} data={posts} emptyText="暂无博客文章" />
      </div>

      <DeleteConfirmDialog
        open={deleteId !== null}
        title="删除文章"
        message="确定要删除这篇文章吗？此操作无法撤销。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
