import { Controller } from '@nestjs/common';

import { UserServersService } from './user-servers.service';

@Controller('')
export class UserServersController {
  constructor(private userServersService: UserServersService) {}
}
