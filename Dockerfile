FROM oven/bun

COPY . .
RUN bun i

RUN bun run ./index.ts /var/rinha/source.rinha.json

CMD ["bun", "run", "./out.js"]