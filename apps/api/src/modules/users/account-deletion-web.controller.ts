import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AccountDeletionService } from './account-deletion.service';

@Controller('account-deletion')
export class AccountDeletionWebController {
  constructor(private readonly accountDeletionService: AccountDeletionService) {}

  @Get()
  getAccountDeletionPage(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(this.accountDeletionService.renderAccountDeletionHtml());
  }
}
