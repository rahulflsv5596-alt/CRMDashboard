import Atlas from '@/components/Atlas';
import { Analytics } from '@vercel/analytics/next';
export default function Page() {
  return (<div>
    <Atlas />
    <Analytics/>
    </div>);
}
