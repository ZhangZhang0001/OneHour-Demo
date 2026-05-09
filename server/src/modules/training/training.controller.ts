import { Controller, Post, Get, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Controller('training')
export class TrainingController {
  // 获取培训资料列表
  @Get('list')
  async getList() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('training_materials')
      .select('id, title, description, file_type, file_key, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取培训资料列表失败:', error);
      throw new Error(`获取列表失败: ${error.message}`);
    }
    
    return { code: 200, msg: 'success', data: { materials: data || [] } };
  }

  // 获取培训资料数量
  @Get('count')
  async getCount() {
    const client = getSupabaseClient();
    const { count, error } = await client
      .from('training_materials')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('获取培训资料数量失败:', error);
      throw new Error(`获取数量失败: ${error.message}`);
    }
    
    return { code: 200, msg: 'success', data: { count: count || 0 } };
  }

  // 上传培训资料
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body() body: { title: string; description?: string }
  ) {
    const client = getSupabaseClient();
    
    // 生成文件存储 key
    const timestamp = Date.now();
    const originalName = file.originalname || 'file';
    const fileName = `training/${timestamp}_${originalName}`;
    
    // 上传到对象存储
    const { S3Storage } = await import('coze-coding-dev-sdk');
    const storage = new S3Storage({
      region: 'cn-beijing',
    });
    
    let fileKey: string;
    try {
      // 根据不同平台获取文件内容
      const fileContent = file.buffer || Buffer.from(file.path || '');
      fileKey = await storage.uploadFile({
        fileContent,
        fileName,
        contentType: file.mimetype,
      });
    } catch (uploadError) {
      console.error('文件上传失败:', uploadError);
      // 如果 buffer 上传失败，尝试从临时文件读取
      try {
        const fs = await import('fs');
        const fileContent = fs.readFileSync(file.path);
        fileKey = await storage.uploadFile({
          fileContent,
          fileName,
          contentType: file.mimetype,
        });
      } catch (fsError) {
        console.error('文件系统读取失败:', fsError);
        throw new Error('文件上传失败');
      }
    }
    
    // 保存记录到数据库
    const { data, error } = await client
      .from('training_materials')
      .insert({
        title: body.title,
        description: body.description || '',
        file_key: fileKey,
        file_type: file.mimetype,
      })
      .select()
      .single();
    
    if (error) {
      console.error('保存培训资料记录失败:', error);
      throw new Error(`保存记录失败: ${error.message}`);
    }
    
    return { code: 200, msg: '上传成功', data: { material: data } };
  }

  // 获取查看链接
  @Post('view')
  async getViewUrl(@Body() body: { file_key: string }) {
    const { S3Storage } = await import('coze-coding-dev-sdk');
    const storage = new S3Storage({
      region: 'cn-beijing',
    });
    
    try {
      const url = await storage.generatePresignedUrl({
        key: body.file_key,
        expireTime: 3600, // 1小时有效期
      });
      
      return { code: 200, msg: 'success', data: { url } };
    } catch (error) {
      console.error('生成预览链接失败:', error);
      throw new Error('生成预览链接失败');
    }
  }

  // 批量删除培训资料
  @Post('batch-delete')
  async batchDelete(@Body() body: { ids: number[] }) {
    const client = getSupabaseClient();
    
    console.log('批量删除培训资料 - ids:', body.ids);
    
    if (!body.ids || body.ids.length === 0) {
      return { code: 400, msg: '请选择要删除的记录', data: null };
    }
    
    // 从数据库删除记录
    const { error } = await client
      .from('training_materials')
      .delete()
      .in('id', body.ids);
    
    if (error) {
      console.error('批量删除培训资料失败:', error);
      return { code: 500, msg: `删除失败: ${error.message}`, data: null };
    }
    
    return { code: 200, msg: `成功删除 ${body.ids.length} 条培训资料`, data: null };
  }
}
