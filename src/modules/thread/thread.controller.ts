import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators';
import { IdDto } from 'src/dto/id.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { ThreadService } from './thread.service';

@Controller('thread')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @ApiTags('Thread')
  @ApiOperation({ summary: 'Get messages of a Chat Thread' })
  @Auth()
  @Get(':id/messages')
  async getMessages(
    @Param() idDto: IdDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.threadService.getMessagesWithPagination(
      new MongoId(idDto.id),
      paginationDto,
    );
  }

  @ApiTags('Thread')
  @ApiOperation({ summary: 'List Threads' })
  @Auth()
  @Get('list')
  async list(@Param() paginationDto: PaginationDto) {
    return this.threadService.listWithPagination(paginationDto);
  }
}
