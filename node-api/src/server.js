// Copyright (c) 2025 Andrew Peris
// Licensed under the MIT License. See LICENSE file in the project root for details.

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});
