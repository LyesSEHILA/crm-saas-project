import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() dto: any) {
    return await this.tasksService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.tasksService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return await this.tasksService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.tasksService.remove(id);
  }
}