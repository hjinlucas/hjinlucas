require('dotenv').config();

async function generateStats() {
    const { data: repos } = await axios.get(`https://api.github.com/users/hjinlucas/repos?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });
  const languageStats = await getLanguageStats();
  const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);

  let languages = Object.entries(languageStats)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [language, count]) => {
      acc[language] = ((count / repos.length) * 100).toFixed(2);
      return acc;
    }, {});

  const privateLanguageStats = languageStats.private;
  if (privateLanguageStats) {
    Object.entries(privateLanguageStats).forEach(([language, count]) => {
      const percentage = ((count / Object.values(languageStats.private).reduce((acc, count) => acc + count, 0)) * 100).toFixed(2);
      languages[`${language} [private]`] = percentage;
    });
  }

  const stats = {
    totalStars: totalStars.toLocaleString(),
    languages,
    totalCommits: await getTotalCommits(),
    totalContributors: await getTotalContributors(),
    totalIssues: await getTotalIssues(),
    totalPullRequests: await getTotalPullRequests(),
  };

  return stats;
}
