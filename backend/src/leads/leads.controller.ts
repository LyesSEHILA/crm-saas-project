import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Response } from 'express'; // Import standard

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('export/csv')
  async exportLeads(@Res() res: any) { // On utilise 'any' ici pour éviter l'erreur TS1272 de métadonnées
    const csvData = await this.leadsService.exportToCSV();
    
    res.header('Content-Type', 'text/csv');
    res.attachment('export-leads-crm.csv');
    return res.send(csvData);
  }

  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return await this.leadsService.create(createLeadDto);
  }

  @Get()
  async findAll() {
    return await this.leadsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.leadsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return await this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.leadsService.remove(id);
  }
}