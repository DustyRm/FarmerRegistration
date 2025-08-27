import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateFarmerDto, UpdateFarmerDto } from './dto/farmer.dto';
import { CreateFarmerUseCase } from '../application/use-cases/create-farmer.use-case';
import { ListFarmersUseCase } from '../application/use-cases/list-farmers.use-case';
import { GetFarmerUseCase } from '../application/use-cases/get-farmer.use-case';
import { UpdateFarmerUseCase } from '../application/use-cases/update-farmer.use-case';
import { RemoveFarmerUseCase } from '../application/use-cases/remove-farmer.use-case';
import { presentFarmer, presentFarmers } from './mappers';

@ApiTags('farmers')
@Controller('farmers')
export class FarmersController {
  constructor(
    private readonly createUC: CreateFarmerUseCase,
    private readonly listUC: ListFarmersUseCase,
    private readonly getUC: GetFarmerUseCase,
    private readonly updateUC: UpdateFarmerUseCase,
    private readonly removeUC: RemoveFarmerUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateFarmerDto) {
    const created = await this.createUC.execute({
      fullName: dto.fullName,
      cpf: dto.cpf,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      phone: dto.phone,
    });
    return presentFarmer(created);
  }

  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'cpf', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  async findAll(
    @Query('name') name?: string,
    @Query('cpf') cpf?: string,
    @Query('active') active?: string,
  ) {
    const activeBool = typeof active === 'string' ? active === 'true' : undefined;
    const list = await this.listUC.execute({ name, cpf, active: activeBool });
    return presentFarmers(list);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const farmer = await this.getUC.execute(id);
    return presentFarmer(farmer);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFarmerDto) {
    const updated = await this.updateUC.execute({
      id,
      fullName: dto.fullName,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      phone: dto.phone,
      active: dto.active,
    });
    return presentFarmer(updated);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.removeUC.execute(id);
    return { success: true };
  }
}
