// src/artists/artists.controller.ts
//
// A REST controller (not GraphQL) is used specifically for the portrait
// endpoint, since streaming raw binary with a Content-Type header doesn't fit
// GraphQL's JSON response model. The rest of the Artist API (CRUD, relations)
// can still be GraphQL — this is a narrow, deliberate exception.

import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artists: ArtistsService) {}

  // Public: no auth guard — portraits are visible to anyone viewing a
  // published artist, same visibility rule as the rest of the public API.
  @Get(':id/portrait')
  async getPortrait(@Param('id') id: string, @Res() res: Response) {
    const portrait = await this.artists.getPortrait(id);
    if (!portrait) throw new NotFoundException('No portrait set for this artist');

    res.setHeader('Content-Type', portrait.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // mitigates lack of CDN caching
    res.send(portrait.buffer);
  }
}
