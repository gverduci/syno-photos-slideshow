import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import de from 'javascript-time-ago/locale/en';
import fr from 'javascript-time-ago/locale/en';
import it from 'javascript-time-ago/locale/en';
import es from 'javascript-time-ago/locale/en';
import { getConfig } from '@/utils/config';

TimeAgo.addLocale(en);

type Props = {
  datePhoto: number; // timestamp in milliseconds
};

export const PhotoDate = ({ datePhoto }: Props) => {
  const config = getConfig();
  const timeAgo = new TimeAgo(config.lang || 'en');
  const ago = timeAgo.format(new Date(datePhoto));

  return (
    <div className="absolute right-0 bottom-0 px-4 py-3 pr-20 w-100">
      <h2 className="text-5xl font-bold">{ago}</h2>
    </div>
  );
};
