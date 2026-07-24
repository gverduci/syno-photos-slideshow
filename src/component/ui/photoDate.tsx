"use client";

import { useState, useEffect } from 'react';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addLocale(en);

type Props = {
  datePhoto: number; // timestamp in milliseconds
};

export const PhotoDate = ({ datePhoto }: Props) => {
  const [ago, setAgo] = useState('');

  useEffect(() => {
    const timeAgo = new TimeAgo('en');
    setAgo(timeAgo.format(new Date(datePhoto)));
  }, [datePhoto]);

  return (
    <div className="absolute right-0 bottom-0 px-4 py-3 pr-20 w-100">
      <h2 className="text-5xl font-bold">{ago}</h2>
    </div>
  );
};
