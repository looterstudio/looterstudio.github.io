/* SKYNET roster. One entry per AI influencer; the page builds itself from this list.
   To add a unit: fill name, handles and videos (TikTok video ids), set status to 'live'.
   Optional images live in assets/skynet/<id>/ : avatar.jpg, and one cover per video.
   With no images, the page asks TikTok for each video's cover and uses the first one as the face. */
window.SKYNET_UNITS = [
  {
    id: 'zyzz',
    no: '001',
    status: 'live',
    name: 'Zyzz',
    tagline: "We're all gonna make it brah.",
    niche: 'Fitness · lifestyle',
    bio: 'Full time mogger. Aesthetics, sun, speed.',
    avatar: '',
    tiktok: 'zyzzbrah6969',
    instagram: 'zyzz.backbrah',
    videos: [
      { id: '7694367681524403476', title: 'rooftop', cover: '' },
      { id: '7694370433927351572', title: 'salt flats', cover: '' }
    ]
  },
  { id: 'unit-002', no: '002', status: 'soon' },
  { id: 'unit-003', no: '003', status: 'soon' },
  { id: 'unit-004', no: '004', status: 'soon' },
  { id: 'unit-005', no: '005', status: 'soon' }
];
