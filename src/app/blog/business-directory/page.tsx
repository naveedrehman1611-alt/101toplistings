import type { Metadata } from 'next';
import { BLOG_CLUSTERS } from '@/lib/blog-clusters';
import { BlogClusterPage, clusterMetadata } from '@/components/blog-cluster-page';

export const revalidate = 600;

const cluster = BLOG_CLUSTERS[0];

export async function generateMetadata(): Promise<Metadata> {
  return clusterMetadata(cluster);
}

export default function Page() {
  return <BlogClusterPage cluster={cluster} />;
}
